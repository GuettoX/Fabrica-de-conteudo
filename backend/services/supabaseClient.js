const { createClient } = require('@supabase/supabase-js')

console.log('======================')
console.log('INICIANDO SUPABASE')
console.log('======================')

console.log('SUPABASE_URL:')
console.log(process.env.SUPABASE_URL)

console.log('SERVICE ROLE EXISTE?')
console.log(!!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('SUPABASE CLIENT CRIADO')

module.exports = supabase