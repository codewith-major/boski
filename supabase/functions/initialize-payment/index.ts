import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Create a Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { orderId } = await req.json()
    if (!orderId) {
      throw new Error('Missing orderId');
    }

    // Load the order. The RLS policies ensure the user can only read their own orders.
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, customer_id, price, currency, status, payment_status, profiles!customer_id(email)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found or inaccessible');
    }

    // 5. Confirm the caller is the CUSTOMER for the order
    if (order.customer_id !== user.id) {
      throw new Error('Only the customer can initialize payment for this order');
    }

    // 7. Confirm the order is in a payment-eligible state
    if (order.status !== 'ACCEPTED') {
      throw new Error('Order must be ACCEPTED to initialize payment');
    }

    // 8. Confirm payment_status is currently UNPAID
    if (order.payment_status !== 'UNPAID') {
      throw new Error('Order is already paid or in an invalid payment state');
    }

    // Prepare trusted amount and currency
    const expectedAmount = parseFloat(order.price);
    const expectedCurrency = order.currency;

    if (expectedCurrency !== 'NGN') {
      throw new Error('Only NGN currency is supported for Paystack');
    }

    // Convert to kobo (smallest unit)
    const amountInKobo = Math.round(expectedAmount * 100);

    // Create admin client for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if there is already a PENDING transaction
    // If so, we can optionally abandon it or just create a new one. We'll create a new one.
    // The previous one remains PENDING and could eventually be marked ABANDONED.

    // 17. Generate a unique payment reference
    const reference = `BOSKI_PAY_${crypto.randomUUID()}`;

    // 16. Create a payment transaction safely
    const { error: txError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        order_id: order.id,
        provider: 'PAYSTACK',
        reference: reference,
        amount: expectedAmount, // Save normal amount
        currency: expectedCurrency,
        status: 'PENDING'
      })

    if (txError) {
      throw new Error(`Failed to create payment transaction: ${txError.message}`);
    }

    // 19. Initialize the Paystack transaction server-side
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const email = Array.isArray(order.profiles) ? order.profiles[0].email : order.profiles?.email || user.email;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInKobo,
        email: email,
        reference: reference,
        callback_url: `${req.headers.get('origin') || 'http://localhost:3000'}/orders/${order.id}`,
        metadata: {
          order_id: order.id,
          customer_id: user.id
        }
      })
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      throw new Error(`Paystack initialization failed: ${paystackData.message}`);
    }

    // 20. Return ONLY the information the browser actually needs
    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
