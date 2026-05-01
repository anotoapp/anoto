// Supabase Edge Function for Kiwify Webhook
// Path: supabase/functions/kiwify-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const { order_status, customer, product_name, plan_name } = payload

    // Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Webhook received: ${order_status} for ${customer.email}`)

    if (order_status === 'paid' || order_status === 'approved') {
      // 1. Find profile by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email)
        .single()

      if (profile) {
        // 2. Update store subscription
        await supabase
          .from('stores')
          .update({ 
            subscription_status: 'active',
            plan_type: plan_name || 'Pro',
            last_payment_at: new Date().toISOString()
          })
          .eq('owner_id', profile.id)
      }
    } else if (order_status === 'refunded' || order_status === 'canceled') {
      // Handle cancellation
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email)
        .single()

      if (profile) {
        await supabase
          .from('stores')
          .update({ subscription_status: 'expired' })
          .eq('owner_id', profile.id)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
