import { Router } from 'express'
import { z } from 'zod'
import { analyzeYoutubeKey } from '../services/youtubeAnalyzer'

const router = Router()

const analysisSchema = z.object({
  url: z.string().url(),
})

router.post('/youtube-key', async (req, res) => {
  const parsed = analysisSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      message: 'L’URL YouTube est invalide.',
    })
    return
  }

  try {
    const result = await analyzeYoutubeKey(parsed.data.url)

    res.json(result)
  } catch (error) {
    console.error('YouTube analysis failed:', error)

    res.status(500).json({
      message:
        'Impossible d’analyser cette vidéo. Elle est peut-être indisponible ou protégée.',
    })
  }
})

export default router