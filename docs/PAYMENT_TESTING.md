# Boski Payment Testing Plan (Sandbox)

This document outlines the step-by-step procedures to manually verify the Paystack payment integration in the sandbox environment.

## Prerequisites
1. **Supabase Environment:** The `0006_payment_architecture.sql` and `0007_payment_security.sql` migrations must be applied.
2. **Paystack Sandbox:** A Paystack sandbox account must be active.
3. **Edge Functions:** The `initialize-payment` and `paystack-webhook` Edge Functions must be deployed.
4. **Secrets:** `PAYSTACK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must be configured securely in the Supabase Vault.
5. **Webhook URL:** Your Supabase project's Edge Function URL (`https://<project>.supabase.co/functions/v1/paystack-webhook`) must be configured as the webhook URL in the Paystack Dashboard.

## Test 1: Security - Unauthorized Initialization
1. Ensure you are completely logged out.
2. Attempt to make a raw POST request to the `initialize-payment` Edge Function with a valid `orderId`.
3. **Expected Result:** The request is rejected with a `400` or `401` error (`Missing Authorization header`).

## Test 2: Security - Non-Customer Initialization
1. Log in as a User (e.g., the Provider of an order).
2. Attempt to call `initialize-payment` for an order where you are NOT the customer.
3. **Expected Result:** The request is rejected with `Only the customer can initialize payment for this order`.

## Test 3: Lifecycle Integrity
1. Log in as a Customer.
2. Call `initialize-payment` for an order in the `REQUESTED` status.
3. **Expected Result:** Rejected with `Order must be ACCEPTED to initialize payment`.
4. Call `initialize-payment` for an order already in the `PAID` status.
5. **Expected Result:** Rejected with `Order is already paid or in an invalid payment state`.

## Test 4: Price Integrity
1. Log in as a Customer.
2. Create an order with a price of `₦5000`. Wait for the Provider to `ACCEPT` it.
3. In the UI, click **MAKE PAYMENT**.
4. Intercept the network request to the Edge Function and try injecting `amount: 500`.
5. **Expected Result:** The Edge Function completely ignores the injected amount, queries `5000` from the DB, and Paystack opens requesting `₦5000`.

## Test 5: End-to-End Success
1. Customer clicks **MAKE PAYMENT** on an `ACCEPTED` order.
2. Verify redirect to Paystack checkout.
3. Complete the payment using Paystack's test cards (e.g., success card).
4. Paystack redirects back to the Order Detail page (with `?reference=...`).
5. **Expected UI State:** The page displays `VERIFYING PAYMENT...` and begins polling.
6. **Expected Backend State:** The Paystack Webhook successfully authenticates, marks `payment_transactions` as `SUCCESS`, and updates `orders.status = PAID`.
7. **Expected UI Resolution:** The polling resolves, and the UI changes to display `MARK AS ACTIVE`.

## Test 6: Webhook Idempotency
1. Copy the webhook payload from Test 5.
2. Manually send the exact same webhook payload to the Edge Function again using Postman/cURL (including the correct `x-paystack-signature`).
3. **Expected Result:** The webhook returns `200` but logs `Already processed`. No duplicate database entries are created.

## Test 7: Payment Failure & Retry
1. Customer initiates payment, then closes the Paystack popup/redirect (cancels).
2. Customer returns to the Order Detail page.
3. **Expected Result:** The order is still `ACCEPTED`. The `payment_transactions` record remains `PENDING`.
4. Customer clicks **MAKE PAYMENT** again.
5. **Expected Result:** A new unique reference is generated, a new `payment_transactions` record is created, and checkout opens successfully.

## Test 8: RLS Security Verification
1. Log in as a normal student.
2. Open the Supabase REST API or use the browser console to run:
   ```javascript
   await supabase.from('orders').update({ payment_status: 'PAID' }).eq('id', 'YOUR_ORDER_ID')
   ```
3. **Expected Result:** Fails immediately with `payment_status cannot be modified directly via frontend`.
4. Run:
   ```javascript
   await supabase.from('orders').update({ status: 'PAID' }).eq('id', 'YOUR_ORDER_ID')
   ```
5. **Expected Result:** Fails immediately with `status cannot be manually set to PAID via frontend`.
