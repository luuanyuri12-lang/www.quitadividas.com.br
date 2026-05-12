export function calcularPrioridade(taxaMensal: number): 'ALTA' | 'MEDIA' | 'BAIXA' {
  if (taxaMensal > 5) return 'ALTA'
  if (taxaMensal >= 2) return 'MEDIA'
  return 'BAIXA'
}
