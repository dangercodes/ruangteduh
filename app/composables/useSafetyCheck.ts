import type { SafetyCheckResult } from '~/types'

export const useSafetyCheck = () => {
  const crisisKeywords = [
    // Indonesian
    'bunuh diri', 'ingin mati', 'mau mati', 'lebih baik mati',
    'tidak ingin hidup', 'tidak mau hidup', 'akhiri hidup',
    'mengakhiri hidup', 'menyakiti diri', 'melukai diri',
    'gantung diri', 'lompat dari', 'overdosis',
    'tidak ada gunanya hidup', 'dunia lebih baik tanpa',
    // English
    'kill myself', 'want to die', 'end my life', 'suicide',
    'self harm', 'self-harm', 'hurt myself', 'better off dead',
    'no reason to live', 'world better without me',
  ]

  const checkMessage = (message: string): SafetyCheckResult => {
    const lowerMessage = message.toLowerCase()

    const isCrisis = crisisKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    )

    if (isCrisis) {
      return {
        isCrisis: true,
        message:
          'Sepertinya kamu sedang mengalami masa yang sangat sulit. Kamu tidak sendirian, dan ada bantuan profesional yang tersedia untukmu.',
        hotline: '119 ext 8 (Into The Light Indonesia)',
      }
    }

    return { isCrisis: false }
  }

  return {
    checkMessage,
  }
}
