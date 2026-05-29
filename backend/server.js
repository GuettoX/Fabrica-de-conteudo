const express = require('express')
const cors = require('cors')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const generateScriptRoute = require('./routes/generateScript')
app.use('/generate-script', generateScriptRoute)

app.get('/', (req, res) => {
  res.send('GuettoX API Online')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})