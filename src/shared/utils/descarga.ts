/**
 * Dispara la descarga de un blob en el navegador con el nombre indicado.
 * Se usa para exportar reportes (US-018).
 */
export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/**
 * Extrae el nombre de archivo de una cabecera Content-Disposition.
 * Devuelve el fallback si la cabecera no viene o no trae filename.
 */
export function nombreDesdeContentDisposition(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  if (!contentDisposition) return fallback
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition)
  return match ? decodeURIComponent(match[1]) : fallback
}
