const express = require('express')
const router = express.Router()

const { searchPixabay } = require('../services/mediaService')

router.post('/', async (req, res) => {

  try {

    const { keyword } = req.body

    const results = await searchPixabay(keyword)

    res.json(results)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      erro: 'Erro ao buscar mídia'
    })

  }

})

module.exports = router