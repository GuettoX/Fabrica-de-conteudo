const axios = require('axios')

async function searchPixabay(keyword, page = 1) {

  const response = await axios.get(
    'https://pixabay.com/api/',
    {
      params: {
        key: process.env.PIXABAY_API_KEY,
        q: keyword,
        image_type: 'photo',
        per_page: 20,
        page: page
      }
    }
  )

  const shuffled = response.data.hits.sort(() => Math.random() - 0.5)

  return shuffled.slice(0, 4).map(item => ({
    media_url: item.largeImageURL,
    preview_url: item.previewURL,
    media_type: 'image',
    source: 'pixabay'
  }))
}

module.exports = {
  searchPixabay
}