const express = require('express')
const router = express.Router()

const generateText = require('../services/openaiService')

router.post('/', async (req, res) => {
  try {
    const { tema, emocao } = req.body

    const prompt = `
    Crie um roteiro cinematográfico para YouTube.

    Tema: ${tema}
    Emoção principal: ${emocao}

    Responda SOMENTE em JSON válido, com os seguintes campos:
    {
      "titulo": "...",
      "hook": "...",
      "introducao": "...",
      "desenvolvimento": "...",
      "climax": "...",
      "encerramento": "...",
      "cta": "..."
    }
    `

    const content = await generateText(prompt)

    let roteiroEstruturado
    try {
      roteiroEstruturado = JSON.parse(content)
    } catch (err) {
      roteiroEstruturado = { texto: content }
    }

    res.json(roteiroEstruturado)

  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao gerar roteiro' })
  }
})

module.exports = router
