const fs = require('fs')
const path = require('path')
const axios = require('axios')

async function downloadFile(url, outputPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath)

    response.data.pipe(writer)

    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function testDownloads(scenes, voiceover) {
  const tempDir = path.join(__dirname, '../temp')

  const imagesDir = path.join(tempDir, 'images')
  const audioDir = path.join(tempDir, 'audio')

  fs.mkdirSync(imagesDir, { recursive: true })
  fs.mkdirSync(audioDir, { recursive: true })

  console.log('PASTAS TEMP CRIADAS')

  if (scenes.length > 0) {
    const firstImage = scenes[0].media_url

    const imagePath = path.join(imagesDir, 'scene1.jpg')

    await downloadFile(firstImage, imagePath)

    console.log('IMAGEM BAIXADA:', imagePath)
  }

  const audioPath = path.join(audioDir, 'voiceover.mp3')

  await downloadFile(voiceover.audio_url, audioPath)

  console.log('AUDIO BAIXADO:', audioPath)

  return true
}

module.exports = {
  testDownloads
}