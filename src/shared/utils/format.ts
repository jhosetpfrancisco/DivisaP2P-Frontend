/** Formatea una fecha ISO ('2026-05-21T09:30:00') a 'YYYY-MM-DD HH:mm' sin usar Date. */
export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return iso.replace('T', ' ').slice(0, 16)
}

/** Formatea un monto a 2 decimales, con la divisa al lado si se indica. */
export function formatMonto(valor: number, divisa?: string): string {
  const numero = valor.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return divisa ? `${numero} ${divisa}` : numero
}

/**
 * Parsea una fecha de la API a milisegundos.
 * El backend guarda en UTC pero serializa sin el sufijo 'Z', así que se lo
 * agregamos para que no se interprete como hora local.
 */
function parseUtc(iso: string): number {
  return Date.parse(/[Zz]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`)
}

/**
 * Plazo restante hasta una fecha límite, en texto ('1 h 25 min').
 * Se usa para mostrar el tiempo que queda para la siguiente acción (US-011).
 */
export function tiempoRestante(iso: string | null | undefined, ahora = Date.now()): string {
  if (!iso) return '—'
  const restante = parseUtc(iso) - ahora
  if (restante <= 0) return 'Plazo vencido'

  const minutos = Math.floor(restante / 60_000)
  const horas = Math.floor(minutos / 60)
  return horas > 0 ? `${horas} h ${minutos % 60} min` : `${minutos} min`
}

/** True si el plazo ya venció. */
export function plazoVencido(iso: string | null | undefined, ahora = Date.now()): boolean {
  return !!iso && parseUtc(iso) - ahora <= 0
}

/** Estados de transacción tal como los nombra el documento de historias de usuario. */
const ETIQUETAS_TRANSACCION: Record<string, string> = {
  PendientePago: 'Pendiente de pago',
  PagoReportado: 'Pago reportado',
  PagoConfirmado: 'Pago confirmado',
  EntregaReportada: 'Entrega reportada',
  Completada: 'Completada',
  Cancelada: 'Cancelada',
  EnDisputa: 'En disputa',
}

/** Estados de usuario tal como los nombra el documento de historias de usuario. */
const ETIQUETAS_USUARIO: Record<string, string> = {
  PendienteVerificacion: 'Pendiente de verificación',
  PendienteAprobacion: 'Pendiente de aprobación',
  Activo: 'Activo',
  Bloqueado: 'Bloqueado',
}

/** Resoluciones de disputa tal como las nombra el documento de historias de usuario. */
const ETIQUETAS_RESOLUCION: Record<string, string> = {
  AFavorComprador: 'A favor del comprador',
  AFavorVendedor: 'A favor del vendedor',
  Anulada: 'Anulada',
}

/** Convierte el estado que devuelve la API ('PendientePago') a texto legible. */
export function etiquetaEstado(estado: string | null | undefined): string {
  if (!estado) return '—'
  return ETIQUETAS_TRANSACCION[estado] ?? ETIQUETAS_USUARIO[estado] ?? estado
}

/** Convierte la resolución que devuelve la API ('AFavorComprador') a texto legible. */
export function etiquetaResolucion(resolucion: string | null | undefined): string {
  if (!resolucion) return '—'
  return ETIQUETAS_RESOLUCION[resolucion] ?? resolucion
}

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

/** Variante de badge según el estado de una transacción. */
export function estadoTransaccionVariant(estado: string): BadgeVariant {
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

/** Variante de badge según el estado de una oferta. */
export function estadoOfertaVariant(estado: string): BadgeVariant {
  switch (estado) {
    case 'Activa':
      return 'success'
    case 'Agotada':
      return 'info'
    case 'Expirada':
    case 'Cancelada':
      return 'neutral'
    default:
      return 'neutral'
  }
}

/** Variante de badge según el estado de una cuenta de usuario. */
export function estadoUsuarioVariant(estado: string): BadgeVariant {
  switch (estado) {
    case 'Activo':
      return 'success'
    case 'Bloqueado':
      return 'danger'
    case 'PendienteVerificacion':
    case 'PendienteAprobacion':
      return 'warning'
    default:
      return 'neutral'
  }
}

/** Variante de badge según el estado de una disputa. */
export function estadoDisputaVariant(estado: string): BadgeVariant {
  return estado === 'Resuelta' ? 'success' : 'warning'
}
