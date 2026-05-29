const express = require('express')
const router = express.Router()

const generateText = require('../services/openaiService')
const supabase = require('../services/supabaseClient')

router.post('/', async (req, res) => {
try {

```
const { tema, emocao } = req.body

const prompt = `
```

Crie um roteiro cinematográfico para YouTube.

Tema: ${tema}
Emoção principal: ${emocao}

Responda SOMENTE em JSON válido:

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

```
const content = await generateText(prompt)

const roteiroEstruturado = JSON.parse(content)

const { error } = await supabase
  .from('scripts')
  .insert([
    {
      tema,
      emocao,
      titulo: roteiroEstruturado.titulo,
      hook: roteiroEstruturado.hook,
      introducao: roteiroEstruturado.introducao,
      desenvolvimento: roteiroEstruturado.desenvolvimento,
      climax: roteiroEstruturado.climax,
      encerramento: roteiroEstruturado.encerramento,
      cta: roteiroEstruturado.cta
    }
  ])

if (error) {
  console.log('ERRO SUPABASE:')
  console.log(error)
} else {
  console.log('SALVO NO SUPABASE')
}

res.json(roteiroEstruturado)
```

} catch (error) {

```
console.log(error)

res.status(500).json({
  erro: 'Erro ao gerar roteiro'
})
```

}
})

module.exports = router

