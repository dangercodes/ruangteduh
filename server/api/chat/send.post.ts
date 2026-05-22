// Server utils (useGemini, GEMINI_MODEL, SYSTEM_PROMPT, detectCrisis) are auto-imported by Nitro
import type { Content } from '@google/genai'

export default defineEventHandler(async (event) => {
  // Rate Limiting (10 requests per minute)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  if (!checkRateLimit(ip, 10, 60000)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Anda mengirim pesan terlalu cepat. Silakan tunggu beberapa saat.'
    });
  }

  const body = await readBody(event)
  const rawMessage = body.message
  const history = body.history

  if (!rawMessage || typeof rawMessage !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required',
    })
  }

  // Sanitize inputs to prevent XSS
  const message = sanitizeInput(rawMessage);

  // Check for crisis content
  const isCrisis = detectCrisis(message)

  const ai = useGemini()

  // Build conversation history for Gemini format
  const conversationHistory: Content[] = (history || []).slice(-20).map((h: any) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: sanitizeInput(h.content) }],
  }))

  // Build system instruction with safety context
  let systemInstruction = SYSTEM_PROMPT
  if (isCrisis) {
    systemInstruction += '\n\nPERINGATAN: Pengguna menunjukkan tanda-tanda krisis. Prioritaskan keselamatan pengguna, tunjukkan empati mendalam, dan rekomendasikan bantuan profesional (Into The Light: 119 ext 8).'
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 800,
        topP: 0.9,
      },
    })

    const reply = response.text || 'Maaf, saya tidak bisa merespons saat ini. Silakan coba lagi.'

    return {
      reply,
      isCrisis,
    }
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get AI response',
    })
  }
})
