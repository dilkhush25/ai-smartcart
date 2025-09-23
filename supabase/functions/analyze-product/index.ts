import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { imageData, type = 'analyze', query } = await req.json();
    console.log('Request type:', type);

    let prompt = '';
    if (type === 'realtime-scan') {
      prompt = `You are a real-time product scanner AI. Analyze this image and identify ALL visible products, food items, or consumer goods. For each item you can clearly see, provide:

1. Product name (be specific - include brand if visible)
2. Category (Food, Beverage, Electronics, Personal Care, etc.)
3. Brief description
4. Confidence level (percentage - be realistic)
5. Estimated price range if recognizable
6. Brand name if visible
7. Key ingredients if it's a food/drink item
8. Basic nutritional highlights if applicable

IMPORTANT: Only report items you can actually see clearly in the image. Be specific and accurate. If you see multiple of the same item, count them.

Respond with a JSON array of objects with these exact fields: name, category, description, confidence, price, brand, ingredients, nutritionalInfo`;

    } else if (type === 'analyze') {
      prompt = `Analyze this image and identify any products, food items, or objects visible. For each item identified, provide:
1. Product/Item name
2. Category (e.g., Food, Beverage, Electronics, etc.)
3. Brief description
4. Estimated confidence level (as percentage)
5. Any nutritional or ingredient information if it's a food item

Format the response as a JSON array of objects with these fields: name, category, description, confidence, additionalInfo.`;
    } else if (type === 'ingredients') {
      prompt = `Look at this image and identify any food items or products. For each food item found, provide detailed ingredient information including:
1. Main ingredients typically used
2. Common additives or preservatives
3. Nutritional highlights
4. Allergen warnings if applicable

Respond in JSON format with an array of objects containing: name, ingredients, nutritional_info, allergens.`;
    }

    // Handle text-only queries (fallback when no image)
    if (!imageData && query) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Provide ingredient information for: ${query}. Include typical ingredients, nutritional highlights, and any relevant details. Format as JSON with fields: name, ingredients, nutritional_info.`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const analysisResult = JSON.parse(aiResponse);
        return new Response(JSON.stringify({ 
          success: true,
          analysis: analysisResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        return new Response(JSON.stringify({ 
          success: true,
          analysis: { message: aiResponse, items: [] }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!imageData) {
      throw new Error('No image data provided');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const aiResponse = data.choices[0].message.content;
    
    // Try to parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback to text response
      analysisResult = {
        error: false,
        message: aiResponse,
        items: []
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(JSON.stringify({ 
      error: true,
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});