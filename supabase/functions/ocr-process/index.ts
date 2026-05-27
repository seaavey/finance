import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { base64 } = await req.json();

    if (!base64) {
      return new Response(JSON.stringify({ error: 'Missing base64' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OCR_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OCR_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: apiKey },
      body: formData,
    });

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      return new Response(JSON.stringify({ error: data.ErrorMessage?.[0] || 'OCR failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.ParsedResults?.[0]?.ParsedText || '';

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
