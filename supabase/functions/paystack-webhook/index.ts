import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { createHmac } from "node:crypto"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured')
    }

    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      throw new Error('Missing x-paystack-signature header')
    }

    // Read the raw body as text
    const bodyText = await req.text()

    // 2. Verify the Paystack webhook signature
    const hash = createHmac('sha512', paystackSecretKey)
      .update(bodyText)
      .digest('hex')

    // 3. Reject invalid signatures
    if (hash !== signature) {
      throw new Error('Invalid signature')
    }

    // 4. Parse the event
    const event = JSON.parse(bodyText)

    // We only care about successful charges for now
    if (event.event === 'charge.success') {
      const data = event.data
      
      // 5. Extract the payment reference
      const reference = data.reference

      // Create admin client for secure operations
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // 6. Find the matching Boski payment transaction
      const { data: tx, error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('reference', reference)
        .single()

      if (txError || !tx) {
        // 7. If no matching transaction exists, safely reject/log the unknown event
        console.error(`Transaction not found for reference: ${reference}`)
        return new Response('Transaction not found', { status: 200 })
      }

      // 13. Prevent replay/duplicate processing
      if (tx.status === 'SUCCESS') {
        console.log(`Transaction ${reference} already processed`)
        return new Response('Already processed', { status: 200 })
      }

      // 10. Confirm the expected amount (tx.amount is in NGN, data.amount is in kobo)
      const expectedAmountInKobo = Math.round(tx.amount * 100)
      if (data.amount !== expectedAmountInKobo) {
        console.error(`Amount mismatch: expected ${expectedAmountInKobo}, got ${data.amount}`)
        
        // Update transaction to FAILED due to mismatch
        await supabaseAdmin
          .from('payment_transactions')
          .update({ status: 'FAILED' })
          .eq('reference', reference)
          
        return new Response('Amount mismatch', { status: 200 })
      }

      // 11. Confirm the expected currency
      if (data.currency !== tx.currency) {
        console.error(`Currency mismatch: expected ${tx.currency}, got ${data.currency}`)
        
        await supabaseAdmin
          .from('payment_transactions')
          .update({ status: 'FAILED' })
          .eq('reference', reference)

        return new Response('Currency mismatch', { status: 200 })
      }

      // 12. Confirm the transaction actually succeeded
      if (data.status !== 'success') {
        console.error(`Transaction status not success: ${data.status}`)
        
        await supabaseAdmin
          .from('payment_transactions')
          .update({ status: 'FAILED' })
          .eq('reference', reference)

        return new Response('Transaction not successful', { status: 200 })
      }

      // 14. & 15. Update transaction and order atomically-ish using an RPC or sequentially since we are service_role
      // First update the transaction to SUCCESS
      const { error: updateTxError } = await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'SUCCESS' })
        .eq('reference', reference)

      if (updateTxError) {
        throw new Error(`Failed to update transaction: ${updateTxError.message}`)
      }

      // Then update the order to PAID
      const { error: updateOrderError } = await supabaseAdmin
        .from('orders')
        .update({ 
          payment_status: 'PAID',
          status: 'PAID'
        })
        .eq('id', tx.order_id)
        
      if (updateOrderError) {
        console.error(`CRITICAL: Payment tx ${reference} succeeded but order update failed: ${updateOrderError.message}`)
        // In a real system, this should queue for retry or alert an admin.
      }
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error(`Webhook error: ${error.message}`)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})
