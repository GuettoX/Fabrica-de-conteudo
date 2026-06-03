const fs = require('fs')
const path = require('path')
const axios = require('axios')

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')

const supabase = require('./supabaseClient')

ffmpeg.setFfmpegPath(ffmpegPath)

async function downloadFile(url, outputPath) {
  console.log('=================================')
  console.log('BAIXANDO ARQUIVO')
  console.log(url)
  console.log('=================================')

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  console.log('STATUS DOWNLOAD:', response.status)

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath)

    response.data.pipe(writer)

    writer.on('finish', () => {
      console.log('SALVO:', outputPath)
      resolve()
    })

    writer.on('error', (error) => {
      console.error('ERRO AO SALVAR ARQUIVO')
      console.error(error)
      reject(error)
    })
  })
}

async function testDownloads(scenes, voiceover) {
  try {
    const tempDir = path.join(__dirname, '../temp')

    const imagesDir = path.join(tempDir, 'images')
    const audioDir = path.join(tempDir, 'audio')

    fs.mkdirSync(imagesDir, { recursive: true })
    fs.mkdirSync(audioDir, { recursive: true })

    console.log('======================')
    console.log('PASTAS TEMP CRIADAS')
    console.log('======================')

    console.log('TOTAL DE CENAS:', scenes.length)

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]

      const imagePath = path.join(
        imagesDir,
        `scene${i + 1}.jpg`
      )

      console.log('----------------------')
      console.log(`BAIXANDO CENA ${i + 1}`)
      console.log(scene.media_url)

      await downloadFile(
        scene.media_url,
        imagePath
      )

      console.log(`CENA ${i + 1} OK`)
    }

    console.log('======================')
    console.log('TODAS AS IMAGENS BAIXADAS')
    console.log('======================')

    const audioPath = path.join(
      audioDir,
      'voiceover.mp3'
    )

    console.log('AUDIO URL:')
    console.log(voiceover.audio_url)

    await downloadFile(
      voiceover.audio_url,
      audioPath
    )

    console.log('AUDIO OK')

    return true
  } catch (error) {
    console.error('======================')
    console.error('ERRO TESTDOWNLOADS')
    console.error('======================')
    console.error(error)

    throw error
  }
}

async function createTestVideo() {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(__dirname, '../temp/images/scene1.jpg')

    const audioPath = path.join(__dirname, '../temp/audio/voiceover.mp3')

    const outputPath = path.join(__dirname, '../temp/video.mp4')

    console.log('======================')
    console.log('INICIANDO FFMPEG')
    console.log('======================')

    ffmpeg()
      .input(imagePath)
      .loop(10)

      .input(audioPath)

      .videoCodec('libx264')
      .audioCodec('aac')

      .outputOptions([
        '-shortest',
        '-pix_fmt',
        'yuv420p'
      ])

      .on('start', (commandLine) => {
        console.log('FFMPEG COMMAND:')
        console.log(commandLine)
      })

      .on('end', () => {
        console.log('======================')
        console.log('VIDEO CRIADO')
        console.log(outputPath)
        console.log('======================')

        resolve(outputPath)
      })

      .on('error', (err, stdout, stderr) => {
  console.error('======================')
  console.error('ERRO FFMPEG')
  console.error('======================')

  console.error('ERROR:')
  console.error(err)

  console.error('STDOUT:')
  console.error(stdout)

  console.error('STDERR:')
  console.error(stderr)

  reject(err)
})

      .save(outputPath)
  })
}

async function uploadVideoToSupabase(videoPath, scriptId) {
  console.log('======================')
  console.log('UPLOAD VIDEO SUPABASE')
  console.log('======================')

  const fileBuffer = fs.readFileSync(videoPath)

  const fileName = `${scriptId}-${Date.now()}.mp4`

  const { error } = await supabase.storage
    .from('videos')
    .upload(fileName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName)

  console.log('VIDEO URL:')
  console.log(data.publicUrl)

  return data.publicUrl
}

async function updateVideoRecord(videoId, videoUrl) {
  console.log('======================')
  console.log('ATUALIZANDO TABELA')
  console.log('======================')

  console.log('VIDEO ID:')
  console.log(videoId)

  console.log('VIDEO URL:')
  console.log(videoUrl)

  const { data, error } = await supabase
    .from('videos')
    .update({
      status: 'completed',
      video_url: videoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId)
    .select()

  console.log('RESULTADO UPDATE:')
  console.log(data)

  if (error) {
    console.error('ERRO UPDATE:')
    console.error(error)
    throw error
  }

  console.log('VIDEO ATUALIZADO COM SUCESSO')
}

module.exports = {
  testDownloads,
  createTestVideo,
  uploadVideoToSupabase,
  updateVideoRecord
}