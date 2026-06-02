const express = require('express')
const router = express.Router()

const supabase = require('../services/supabaseClient')
const { testDownloads } = require('../services/videoService')

router.post('/', async (req, res) => {
  try {
    console.log('====================')
    console.log('RENDER REQUEST')
    console.log(req.body)
    console.log('====================')

    const { scriptId } = req.body

    if (!scriptId) {
      return res.status(400).json({
        success: false,
        error: 'scriptId não informado'
      })
    }

    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select('*')
      .eq('script_id', scriptId)
      .order('ordem')

    if (scenesError) {
      throw scenesError
    }

    const { data: voiceover, error: voiceError } = await supabase
      .from('voiceovers')
      .select('*')
      .eq('script_id', scriptId)
      .single()

    if (voiceError) {
      throw voiceError
    }

    console.log('SCENES ENCONTRADAS:', scenes.length)
    console.log('AUDIO URL:', voiceover.audio_url)
    console.log('DURAÇÃO AUDIO:', voiceover.duracao)

    await testDownloads(scenes, voiceover)

    return res.json({
      success: true,
      totalScenes: scenes.length,
      audioFound: !!voiceover,
      audioUrl: voiceover.audio_url,
      audioDuration: voiceover.duracao,
      message: 'Backend render funcionando'
    })

  } catch (error) {
    console.error('ERRO RENDER VIDEO')
    console.error(error)

    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router