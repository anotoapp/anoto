// Supabase Edge Function for Kiwify Webhook
// Path: supabase/functions/kiwify-webhook/index.ts
// Deploy: npx supabase functions deploy kiwify-webhook --project-ref ehpnsastaisgnamuqfpn

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Map Kiwify product/plan names to our internal plan names
function mapPlanName(rawName: string | undefined): string {
  if (!rawName) return 'Starter';
  const name = rawName.toLowerCase();
  if (name.includes('diamond')) return 'Diamond';
  if (name.includes('growth')) return 'Growth';
  return 'Starter';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const payload = await req.json()

    // Kiwify sends: order_status, customer { email, name }, product { name }, subscription { plan { name } }
    const orderStatus = payload.order_status || payload.status
    const customerEmail = payload.customer?.email
    const planName = payload.subscription?.plan?.name || payload.product?.name || payload.plan_name

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing customer email' }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      })
    }

    // Initialize Supabase Client with Service Role (admin access)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[Kiwify Webhook] Status: ${orderStatus} | Email: ${customerEmail} | Plan: ${planName}`)

    // 1. Find the profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single()

    if (profileError || !profile) {
      console.warn(`[Kiwify Webhook] Profile not found for email: ${customerEmail}`)
      // Return 200 so Kiwify doesn't retry forever — user may not be registered yet
      return new Response(JSON.stringify({ success: false, message: 'User not found, ignoring.' }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    // 2. Handle status transitions
    if (orderStatus === 'paid' || orderStatus === 'approved' || orderStatus === 'active') {
      const { error } = await supabase
        .from('stores')
        .update({
          subscription_status: 'active',
          plan_type: mapPlanName(planName),
          last_payment_at: new Date().toISOString(),
          subscription_id: payload.order_id || payload.id || null
        })
        .eq('owner_id', profile.id)

      if (error) throw error

      // 3. Garante que o email está na whitelist (para novos cadastros futuros)
      await supabase
        .from('authorized_emails')
        .upsert({
          email: customerEmail.toLowerCase(),
          plan_type: mapPlanName(planName),
          kiwify_order_id: payload.order_id || payload.id || null,
          authorized_at: new Date().toISOString()
        }, { onConflict: 'email' })

      // 4. Enviar email de boas-vindas via Resend
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
      if (RESEND_API_KEY) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'ANOTÔ <onboarding@resend.dev>',
              to: [customerEmail],
              subject: '🚀 Seu acesso ao ANOTÔ está liberado!',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                  <h1 style="color: #dc2626;">Bem-vindo ao ANOTÔ!</h1>
                  <p>Olá! Sua assinatura do <strong>ANOTÔ Profissional</strong> foi confirmada com sucesso.</p>
                  <p>Agora você já pode criar sua loja e começar a vender:</p>
                  <a href="https://anoto.com.br/admin/register" style="display: inline-block; background: #dc2626; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">CRIAR MINHA LOJA AGORA</a>
                  <p style="color: #666; font-size: 0.9rem;"><strong>IMPORTANTE:</strong> No cadastro, use o email: <strong>${customerEmail}</strong></p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
                  <p style="font-size: 0.85rem; color: #64748b;">Dúvidas? Fale conosco:</p>
                  <a href="https://wa.me/5519995933655" style="color: #2563eb; font-weight: 600; text-decoration: none;">WhatsApp de Suporte →</a>
                  <p style="margin-top: 30px; font-weight: bold; color: #0f172a;">Equipe ANOTÔ</p>
                </div>
              `
            })
          })
          const resData = await res.json()
          console.log('[Kiwify Webhook] 📧 Welcome email sent:', resData)
        } catch (emailErr) {
          console.error('[Kiwify Webhook] ❌ Error sending email:', emailErr)
        }
      }

      console.log(`[Kiwify Webhook] ✅ Subscription activated for profile ${profile.id}`)

    } else if (
      orderStatus === 'refunded' ||
      orderStatus === 'canceled' ||
      orderStatus === 'cancelled' ||
      orderStatus === 'chargedback'
    ) {
      const { error } = await supabase
        .from('stores')
        .update({ subscription_status: 'expired' })
        .eq('owner_id', profile.id)

      if (error) throw error

      // Remove da whitelist ao cancelar/reembolsar
      await supabase
        .from('authorized_emails')
        .delete()
        .eq('email', customerEmail.toLowerCase())

      console.log(`[Kiwify Webhook] ❌ Subscription expired for profile ${profile.id}`)
    } else {
      console.log(`[Kiwify Webhook] ⚠️ Unhandled status: ${orderStatus}`)
    }


    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error('[Kiwify Webhook] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
