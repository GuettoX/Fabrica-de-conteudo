const OpenAI = require('openai')

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function generateText(prompt) {

  const response = await client.chat.completions.create({

    model: 'gpt-4o-mini',

    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]

  })

  let content = response.choices[0].message.content

  content = content
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  return content
}

module.exports = generateText