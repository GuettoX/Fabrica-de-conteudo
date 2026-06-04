const express = require('express')
const router = express.Router()

const supabase = require('../services/supabaseClient')

const {
  testDownloads,
  createTestVideo,
  uploadVideoToSupabase,
  updateVideoRecord
} = require('../services/videoService')

router.post('/', async (req, res) => {
  try {
    console.log('====================')
    console.log('RENDER REQUEST')
    console.log(req.body)
    console.log('====================')

    const { scriptId, videoId } = req.body

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

    console.log('DOWNLOADS FINALIZADOS')

    const videoPath = await createTestVideo(
  scenes.length,
  voiceover.duracao
)

    console.log('====================')
    console.log('VIDEO PATH')
    console.log(videoPath)
    console.log('====================')

    const uploadResult =
  await uploadVideoToSupabase(
    videoPath,
    scriptId
  )

const videoUrl =
  uploadResult.videoUrl

const fileSizeMb =
  uploadResult.fileSizeMb

    console.log('====================')
    console.log('VIDEO ENVIADO')
    console.log(videoUrl)
    console.log('====================')

    const thumbnailUrl =
  scenes.length > 0
    ? scenes[0].media_url
    : null

const duration =
  voiceover?.duracao || null

if (videoId) {
  await updateVideoRecord(
  videoId,
  videoUrl,
  thumbnailUrl,
  duration,
  fileSizeMb
)
}

    return res.json({
      success: true,
      videoId,
      videoUrl,
      totalScenes: scenes.length,
      audioFound: !!voiceover,
      audioUrl: voiceover.audio_url,
      audioDuration: voiceover.duracao,
      message: 'Video criado e enviado para Supabase'
    })

  } catch (error) {
    console.error('====================')
    console.error('ERRO RENDER VIDEO')
    console.error('====================')
    console.error(error)

    try {
      if (req.body.videoId) {
        await supabase
          .from('videos')
          .update({
            status: 'error',
            erro: error.message
          })
          .eq('id', req.body.videoId)
      }
    } catch (dbError) {
      console.error(dbError)
    }

    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router