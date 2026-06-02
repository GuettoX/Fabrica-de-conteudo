const express = require('express')
const router = express.Router()

const supabase = require('../services/supabaseClient')

router.post('/', async (req, res) => {
  try {
    const { scriptId } = req.body

    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select('*')
      .eq('script_id', scriptId)
      .order('ordem')

    if (scenesError) throw scenesError

    const { data: voiceover, error: voiceError } = await supabase
      .from('voiceovers')
      .select('*')
      .eq('script_id', scriptId)
      .single()

    if (voiceError) throw voiceError

    return res.json({
      success: true,
      totalScenes: scenes.length,
      audioFound: !!voiceover,
      audioUrl: voiceover.audio_url,
      audioDuration: voiceover.duracao
    })

  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router