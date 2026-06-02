const fs = require('fs')
const path = require('path')
const axios = require('axios')

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

    if (scenes.length > 0) {
      const firstImage = scenes[0].media_url

      console.log('PRIMEIRA IMAGEM:')
      console.log(firstImage)

      const imagePath = path.join(imagesDir, 'scene1.jpg')

      await downloadFile(firstImage, imagePath)

      console.log('IMAGEM OK')
    }

    console.log('AUDIO URL:')
    console.log(voiceover.audio_url)

    const audioPath = path.join(audioDir, 'voiceover.mp3')

    await downloadFile(voiceover.audio_url, audioPath)

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

module.exports = {
  testDownloads
}