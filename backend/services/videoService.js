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
    const scenesDir = path.join(tempDir, 'scenes')

    fs.mkdirSync(imagesDir, { recursive: true })
    fs.mkdirSync(audioDir, { recursive: true })
    fs.mkdirSync(scenesDir, { recursive: true })

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
async function createSceneVideo(
  imagePath,
  duration,
  outputPath
) {

  const totalFrames =
    Math.round(duration * 25)

  const effects = [

    // Zoom In
    `zoompan=z='min(zoom+0.0015,1.15)':d=${totalFrames}:s=1280x720`,

    // Zoom Out
    `zoompan=z='if(lte(zoom,1.15),1.15-0.0015*on,1)':d=${totalFrames}:s=1280x720`,

    // Pan Left
    `zoompan=z=1.1:x='iw/2-(iw/zoom/2)-on*2':d=${totalFrames}:s=1280x720`,

    // Pan Right
    `zoompan=z=1.1:x='on*2':d=${totalFrames}:s=1280x720`,

    // Pan Up
    `zoompan=z=1.1:y='ih/2-(ih/zoom/2)-on*2':d=${totalFrames}:s=1280x720`,

    // Pan Down
    `zoompan=z=1.1:y='on*2':d=${totalFrames}:s=1280x720`,

    // Zoom Cinemático Lento
    `zoompan=z='min(zoom+0.0008,1.08)':d=${totalFrames}:s=1280x720`,

    // Zoom Dramático
    `zoompan=z='min(zoom+0.003,1.25)':d=${totalFrames}:s=1280x720`

  ]

  const randomEffect =
    effects[
      Math.floor(
        Math.random() * effects.length
      )
    ]

  console.log('======================')
  console.log('EFEITO ESCOLHIDO')
  console.log('======================')
  console.log(randomEffect)

  return new Promise((resolve, reject) => {

    ffmpeg()

      .input(imagePath)

      .inputOptions([
        '-loop 1'
      ])

      .videoFilters(
        randomEffect
      )

      .videoCodec('libx264')

      .outputOptions([
        '-t ' + duration,
        '-pix_fmt yuv420p'
      ])

      .on('start', (cmd) => {
        console.log('======================')
        console.log('CRIANDO CENA')
        console.log('======================')
        console.log(cmd)
      })

      .on('end', () => {
        console.log('======================')
        console.log('CENA OK')
        console.log('======================')
        console.log(outputPath)

        resolve(outputPath)
      })

      .on('error', (err, stdout, stderr) => {

        console.error('======================')
        console.error('ERRO CENA')
        console.error('======================')

        console.error(err)

        console.error('STDERR:')
        console.error(stderr)

        reject(err)
      })

      .save(outputPath)

  })
}

async function createTestVideo(
  totalScenes,
  audioDuration
) {
  return new Promise(async (resolve, reject) => {
    const imagesDir = path.join(__dirname, '../temp/images')

    const audioPath = path.join(
      __dirname,
      '../temp/audio/voiceover.mp3'
    )

    const outputPath = path.join(
      __dirname,
      '../temp/video.mp4'
    )

    const slidesFile = path.join(
      __dirname,
      '../temp/slides.txt'
    )

    console.log('======================')
    console.log('CRIANDO SLIDESHOW')
    console.log('======================')

    const imageFiles = fs
      .readdirSync(imagesDir)
      .filter(file => file.endsWith('.jpg'))
      .sort()

    const scenesDir = path.join(
  __dirname,
  '../temp/scenes'
)

const durationPerScene =
  audioDuration / totalScenes

const sceneVideos = []

for (let i = 0; i < imageFiles.length; i++) {

  const imagePath = path.join(
    imagesDir,
    imageFiles[i]
  )

  const sceneOutput = path.join(
    scenesDir,
    `scene${i + 1}.mp4`
  )

  console.log(
    `CRIANDO CENA ${i + 1}`
  )

  await createSceneVideo(
    imagePath,
    durationPerScene,
    sceneOutput
  )

  sceneVideos.push(sceneOutput)
}

console.log('======================')
console.log('TODAS AS CENAS OK')
console.log(sceneVideos)
console.log('======================')
console.log('TOTAL IMAGENS:', imageFiles.length)
console.log('======================')
console.log('DURACAO AUDIO:', audioDuration)
console.log('TOTAL CENAS:', totalScenes)
console.log(
  'DURACAO POR CENA:',
  durationPerScene
)
console.log('======================')
    let slidesContent = ''

sceneVideos.forEach((video) => {
  slidesContent += `file '${video}'\n`
})

fs.writeFileSync(
  slidesFile,
  slidesContent
)

console.log('VIDEOS.TXT CRIADO')

    ffmpeg()
  .input(slidesFile)
  .inputOptions([
    '-f concat',
    '-safe 0'
  ])

  .input(audioPath)

      .videoCodec('libx264')
      .audioCodec('aac')

      .size('1280x720')

      .outputOptions([
        '-pix_fmt yuv420p',
        '-shortest'
      ])

      .on('start', (commandLine) => {
        console.log('======================')
        console.log('FFMPEG COMMAND')
        console.log(commandLine)
        console.log('======================')
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

  const stats = fs.statSync(videoPath)

const fileSizeMb = Number(
  (stats.size / 1024 / 1024).toFixed(2)
)

  console.log('TAMANHO MB:')
  console.log(fileSizeMb)
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

return {
  videoUrl: data.publicUrl,
  fileSizeMb
}
}
async function uploadThumbnailToSupabase(
  imagePath,
  scriptId
) {
  console.log('======================')
  console.log('UPLOAD THUMBNAIL')
  console.log('======================')

  const fileBuffer =
    fs.readFileSync(imagePath)

  const fileName =
    `${scriptId}-${Date.now()}.jpg`

  const { error } =
    await supabase.storage
      .from('thumbnails')
      .upload(
        fileName,
        fileBuffer,
        {
          contentType: 'image/jpeg',
          upsert: true
        }
      )

  if (error) {
    console.error(error)
    throw error
  }

  const { data } =
    supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName)

  console.log('THUMBNAIL URL:')
  console.log(data.publicUrl)

  return data.publicUrl
}

async function updateVideoRecord(
  videoId,
  videoUrl,
  thumbnailUrl,
  duracao,
  tamanhoMb
) {
  console.log('======================')
  console.log('ATUALIZANDO TABELA')
  console.log('======================')

  console.log('VIDEO ID:')
  console.log(videoId)

  console.log('VIDEO URL:')
  console.log(videoUrl)

  console.log('THUMBNAIL URL:')
  console.log(thumbnailUrl)

  console.log('DURACAO:')
  console.log(duracao)

  const { data, error } = await supabase
    .from('videos')
    .update({
  status: 'completed',
  video_url: videoUrl,
  thumbnail_url: thumbnailUrl,
  duracao: duracao,
  tamanho_mb: tamanhoMb,
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

  const { data: checkVideo, error: checkError } =
    await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

  console.log('======================')
  console.log('VERIFICACAO FINAL')
  console.log('======================')
  console.log(checkVideo)

  if (checkError) {
    console.error(checkError)
  }

  console.log('VIDEO ATUALIZADO COM SUCESSO')
}

module.exports = {
  testDownloads,
  createTestVideo,
  uploadVideoToSupabase,
  uploadThumbnailToSupabase,
  updateVideoRecord
}