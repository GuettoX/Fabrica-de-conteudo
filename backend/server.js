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

app.use('/generate-script', generateScriptRoute)

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})