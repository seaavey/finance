import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { base64, filename } = await readBody<{ base64: string; filename: string }>(event);

  if (!base64) {
    throw createError({ statusCode: 400, statusMessage: 'Missing base64 image data' });
  }

  const config = useRuntimeConfig(event);
  const apiKey = config.ocrApiKey;

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OCR_API_KEY not configured' });
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
    throw createError({
      statusCode: 502,
      statusMessage: data.ErrorMessage?.[0] || 'OCR processing failed',
    });
  }

  const text = data.ParsedResults?.[0]?.ParsedText || '';
  return { text };
});
