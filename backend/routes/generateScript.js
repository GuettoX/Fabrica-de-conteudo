const { data, error } = await supabase
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
