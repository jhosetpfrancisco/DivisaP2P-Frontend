/** Formatea una fecha ISO ('2026-05-21T09:30:00') a 'YYYY-MM-DD HH:mm' sin usar Date. */
export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return iso.replace('T', ' ').slice(0, 16)
}

/** Variante de badge según el estado de una transacción. */
export function estadoTransaccionVariant(
  estado: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' {
  switch (estado) {
    case 'Completada':
      return 'success'
    case 'PendientePago':
      return 'warning'
    case 'Cancelada':
    case 'EnDisputa':
      return 'danger'
    case 'PagoReportado':
    case 'PagoConfirmado':
    case 'EntregaReportada':
      return 'info'
    default:
      return 'neutral'
  }
}
