/**
 * Validación de adjuntos (vouchers de US-009, evidencias de disputa de US-014).
 *
 * Nota: la API no expone endpoint de subida (ReporteDepositoDto solo recibe
 * nombreArchivo y rutaArchivo como texto), así que el archivo se valida y se
 * previsualiza en el cliente, y al backend se le envía la referencia.
 */

/** Extensiones aceptadas por los criterios de aceptación: JPG/PNG/PDF. */
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf']
const EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'pdf']

/** Tamaño máximo por archivo: 5 MB. */
export const TAMANIO_MAXIMO_BYTES = 5 * 1024 * 1024

export function extensionDe(nombre: string): string {
  return nombre.split('.').pop()?.toLowerCase() ?? ''
}

/**
 * Valida un archivo adjunto. Devuelve el mensaje de error, o null si es válido.
 * Se valida por extensión y por MIME: algunos navegadores dejan el type vacío.
 */
export function validarAdjunto(archivo: File): string | null {
  const extension = extensionDe(archivo.name)

  if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
    return 'Formato no permitido. Solo se aceptan archivos JPG, PNG o PDF.'
  }
  if (archivo.type && !TIPOS_PERMITIDOS.includes(archivo.type)) {
    return 'Formato no permitido. Solo se aceptan archivos JPG, PNG o PDF.'
  }
  if (archivo.size > TAMANIO_MAXIMO_BYTES) {
    return `El archivo pesa ${formatPeso(archivo.size)} y el máximo permitido es 5 MB.`
  }
  return null
}

/** Formatea bytes a una unidad legible (ej. '2.4 MB'). */
export function formatPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Ruta con la que se referencia el adjunto en la API.
 * Se agrupa por transacción/disputa para que el nombre sea único y rastreable.
 */
export function rutaAdjunto(carpeta: string, nombreArchivo: string): string {
  return `/uploads/${carpeta}/${nombreArchivo}`
}
