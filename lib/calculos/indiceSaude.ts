export function calcularIndiceSaude(rendaMensal: number, totalParcelas: number) {
  if (rendaMensal === 0) return 0
  const comprometimento = (totalParcelas / rendaMensal) * 100
  const indice = Math.max(0, Math.min(100, 100 - comprometimento))
  return Math.round(indice)
}

export function classificarSaude(indice: number) {
  if (indice <= 30) return { label: 'Crítico', cor: 'danger' }
  if (indice <= 60) return { label: 'Atenção', cor: 'warning' }
  if (indice <= 80) return { label: 'Estável', cor: 'ok' }
  return { label: 'Saudável', cor: 'success' }
}
