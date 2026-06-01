const axios = require('axios')

async function searchPixabay(keyword) {

  const response = await axios.get(
    'https://pixabay.com/api/',
    {
      params: {
        key: process.env.PIXABAY_API_KEY,
        q: keyword,
        image_type: 'photo',
        per_page: 4
      }
    }
  )

  return response.data.hits.map(item => ({
    media_url: item.largeImageURL,
    preview_url: item.previewURL,
    media_type: 'image',
    source: 'pixabay'
  }))
}

module.exports = {
  searchPixabay
}