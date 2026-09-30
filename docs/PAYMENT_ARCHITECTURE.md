# Boski Payment Architecture

This document defines the payment architecture for Boski, detailing how payments are securely initialized, verified, and reconciled using Paystack.

## 1. Payment Goals
- Securely process payments in NGN (Nigerian Naira) from Customers to Providers.
- Eliminate client-side manipulation of payment amounts or order states.
- Ensure payment idempotency and robust recovery mechanisms against network failures or user drop-offs.
- Maintain a clean separation between the `OrderStatus` state machine and the underlying `PaymentStatus`.

## 2. Current Order/Payment Model
- **Identity:** Authenticated via Supabase Auth (`profiles`).
- **Orders Table:**
  - `status` (`OrderStatus`): `REQUESTED | ACCEPTED | PAID | ACTIVE | RETURNED | IN_PROGRESS | COMPLETED | CANCELLED | DECLINED`.
  - `payment_status` (`PaymentStatus`): `UNPAID | PAID | REFUNDED`.
  - `price` (NUMERIC) and `currency` (NGN) are frozen at order creation.
- Currently, there is no Paystack integration, and the frontend does not provide any buttons to mock payment. 

## 3. Proposed Architecture
The architecture will use a **Server-Side Verification Model**:
1. Customer initiates payment on an `ACCEPTED` order.
2. The frontend requests a payment initialization from a secure Supabase Edge Function.
3. The Edge Function reads the frozen `price` from the Supabase database (ignoring any client-provided amount), creates a Paystack transaction, and returns the authorization URL/access code.
4. The client redirects the customer to Paystack or uses the Paystack inline popup.
5. Upon successful checkout, Paystack sends a webhook to another Supabase Edge Function.
6. The webhook is verified using the Paystack webhook secret.
7. The verified webhook marks the transaction as successful and updates the order's `status` and `payment_status` to `PAID`.

## 4. Payment Transaction Model
A dedicated `payment_transactions` table will be introduced to track individual payment attempts. This ensures we can safely track abandoned checkouts, failed attempts, and successful payments without polluting the `orders` table.

**Table: `payment_transactions`**
- `id` (UUID, PK)
- `order_id` (UUID, FK to orders)
- `provider` (TEXT) - Currently 'PAYSTACK'
- `reference` (TEXT, UNIQUE) - Paystack transaction reference
- `amount` (NUMERIC) - The gross amount expected (matches order price)
- `currency` (TEXT) - 'NGN'
- `status` (TEXT) - `PENDING | SUCCESS | FAILED | ABANDONED`
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 5. Paystack Security Boundary
The React client is strictly isolated from Paystack API secrets.
- **Frontend (`.env`):** Will only hold `VITE_PAYSTACK_PUBLIC_KEY` if the inline popup is used (or none if strictly redirecting).
- **Backend (Supabase Edge Functions):** Will hold `PAYSTACK_SECRET_KEY` via Supabase Vault/Secrets.
- The server will **never trust** the client-side `onSuccess` callback to mark an order as paid. The client-side success callback will merely display a "Verifying..." loading state until the backend webhook completes the database update.

## 6. Reference/Idempotency Strategy
Each time a user clicks "Pay", the Edge Function generates a new, unique `payment_transactions` row with a UUID `reference`. 
- Paystack is initialized with this `reference`.
- The database enforces uniqueness on `reference`.
- This prevents the same payment intent from being initialized or verified twice.

## 7. Price Integrity
The client **cannot** specify the amount when requesting payment initialization.
1. Client sends `{ orderId }` to the Edge Function.
2. Edge Function queries `SELECT price FROM orders WHERE id = orderId AND customer_id = auth.uid()`.
3. Edge Function converts the `price` to kobo (the base unit required by Paystack).
4. Paystack is initialized using this server-derived amount.

## 8. NGN Amount Handling
- **Database (`orders.price`, `payment_transactions.amount`):** Stored in standard Naira (e.g., `5000.00`).
- **Paystack API:** Requires amounts in Kobo (e.g., `500000`).
- **Conversion:** Conversion (`amount * 100`) occurs exclusively inside the Edge Function right before making the Paystack API call. 

## 9. Webhook Verification
Paystack sends POST requests to a designated Supabase Edge Function (`/paystack-webhook`).
1. The Edge Function receives the payload and the `x-paystack-signature` header.
2. It hashes the payload body with HMAC SHA512 using the `PAYSTACK_SECRET_KEY`.
3. If the signature matches, the payload is authentic.
4. The system queries the `reference` provided in the payload to find the `payment_transactions` record.

## 10. Server-Side Verification
Upon authentic webhook delivery for a `charge.success` event:
1. Validate that the transaction status is still `PENDING`.
2. Validate that the webhook amount (in kobo) matches the `payment_transactions.amount` (converted to kobo).
3. If valid, update `payment_transactions.status = 'SUCCESS'`.
4. Update `orders.payment_status = 'PAID'` and `orders.status = 'PAID'`.

## 11. Payment State Machine
Allowed transitions involving payments:
- `REQUESTED` → `ACCEPTED` (Provider action)
- `ACCEPTED` → `PAID` (Customer pays successfully via Webhook)
- `PAID` → `ACTIVE` (Provider/Customer confirms handover/start)

**Payment Status logic:**
- Order creates: `UNPAID`
- Webhook succeeds: `PAID`

## 12. Failure Handling
- **Abandoned:** If a customer opens checkout and closes it, the transaction remains `PENDING`. They can retry, which generates a *new* `payment_transactions` row and a new reference.
- **Failed:** If Paystack reports a failure, the webhook marks the transaction `FAILED`. The order remains `UNPAID` and `ACCEPTED`.
- **Client Disconnect:** If the user closes the browser after paying, the server-side webhook guarantees the order is marked paid.

## 13. Refund Architecture (Future Scope)
Refunds are out of scope for Phase 15.1/15.2.
When implemented, they will involve:
- `orders.payment_status = 'REFUNDED'`
- An explicit backend refund flow initiated by an Admin, processing the refund via the Paystack API, and inserting a `REFUND` transaction type into the `payment_transactions` table.

## 14. Provider Payout Future Scope
Provider payouts are **NOT** implemented in this phase.
- Currently, all funds collected settle into the Boski Paystack Merchant account.
- A future Phase will implement Paystack Transfers (Payouts) or Paystack Subaccounts (Split Payments) to route funds to Providers, alongside capturing Provider bank details.

## 15. Platform Fee Future Scope
No platform fees are deducted in this phase.
- The `payment_transactions` amount equals the `orders.price`.
- Future schema iterations may introduce `gross_amount`, `platform_fee`, and `net_amount` into the transaction model.

## 16. Security Model
- Only an authenticated `customer_id` can request payment initialization for their own order.
- Orders must be in the `ACCEPTED` state to be initialized.
- Only the `service_role` key (via the webhook Edge Function) is authorized to modify `payment_transactions.status`, `orders.payment_status`, and transition the order to `PAID`.

## 17. RLS Model for `payment_transactions`
- **SELECT:** Allowed if `auth.uid()` matches `orders.customer_id` or `orders.provider_id` (joined through the `order_id`).
- **INSERT:** Rejected for normal users. Created only by Edge Functions (`service_role`).
- **UPDATE:** Rejected for normal users. Modified only by Edge Functions (`service_role`).
- **DELETE:** Rejected for all users.

## 18. Required Environment Secrets
These secrets must be added to the Supabase project (but will **NOT** be stored in client code):
- `PAYSTACK_SECRET_KEY`: Used by Edge Functions.
- `VITE_PAYSTACK_PUBLIC_KEY`: Used by frontend (if inline checkout is chosen).

## 19. Phase 15.2 Implementation Plan
1. Create Supabase Edge Function for Paystack Checkout Initialization.
2. Create Supabase Edge Function for Paystack Webhooks.
3. Update Frontend `OrderDetail` UI to show a "Make Payment" button when `ACCEPTED` and user is Customer.
4. Implement frontend redirect or popup handling for Paystack.
5. Create loading/verifying states on the frontend while waiting for the webhook.

## 20. Explicit Things That Are NOT Implemented Yet
- Paystack API calls.
- Supabase Edge Functions.
- Payment checkout frontend UI.
- Paystack SDK integrations.
- Payouts / Transfers / Withdrawals.
- Platform Fees.
- Automatic Refunds.
## 21. Phase 15.2 Actual Implementation
The implementation adheres to the architecture described above with the following specifics:
- **Edge Functions**: Created in `supabase/functions/initialize-payment/index.ts` and `supabase/functions/paystack-webhook/index.ts`. Both successfully enforce server-side validation and authentication boundaries.
- **Webhook Verifier**: The `paystack-webhook` uses `node:crypto` HMAC SHA512 to verify authenticity of events using `PAYSTACK_SECRET_KEY`.
- **Amount Integrity**: The client frontend explicitly sends `orderId`. The Edge Function natively extracts the `price` column using a secure `select` restricted by RLS (the caller must be the `customer_id`). The amount is translated to kobo and sent via POST to `https://api.paystack.co/transaction/initialize`.
- **Retries**: A user can retry payment. The Edge Function allows this by regenerating a unique `BOSKI_PAY_...` UUID string on every click, leaving previous records `PENDING`. 
- **Idempotency**: The webhook rejects operations if the specific `payment_transactions` record is already `SUCCESS`.
- **Database Status Protection**: Added migration `0007_payment_security.sql`. An ordinary frontend user CANNOT change `orders.status` to `PAID`. Doing so raises a PostgreSQL exception. It is locked strictly to `service_role` or valid Admins. 

Phase 15.2 Implementation Updates applied.
