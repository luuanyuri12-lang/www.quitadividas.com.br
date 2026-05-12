export function calcularCustoOportunidade(
  valorTotal: number,
  taxaMensal: number,
  mesesRestantes: number
) {
  const jurosTotal = valorTotal * (taxaMensal / 100) * mesesRestantes
  const rendimentoPerdido = jurosTotal * 0.43
  const custoTotal = jurosTotal + rendimentoPerdido
  return {
    jurosTotal: Math.round(jurosTotal),
    rendimentoPerdido: Math.round(rendimentoPerdido),
    custoTotal: Math.round(custoTotal),
  }
}
