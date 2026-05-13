import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productName } = await req.json()

    if (!productName) {
      return new Response(JSON.stringify({ error: 'productName is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Chamada para a API do Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um especialista em marketing gastronômico. Escreva uma descrição curta, suculenta e irresistível para um prato de restaurante chamado "${productName}". 
            Foque no sabor, textura e ingredientes. 
            Regras: 
            - Máximo de 180 caracteres. 
            - Não use hashtags. 
            - Use um tom profissional de cardápio premium.
            - Seja direto ao ponto.`
          }]
        }]
      })
    })

    const data = await response.json()
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
