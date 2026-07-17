import http from '@/shared/api/http'

export interface ArchivoSubidoDto {
  nombreArchivo: string
  rutaArchivo: string
}

/**
 * Subida de archivos (vouchers de US-009/010 y evidencias de disputa de US-014).
 * Devuelve la referencia que luego se adjunta al reporte o a la disputa.
 */
export const archivosService = {
  subir(archivo: File) {
    const form = new FormData()
    form.append('archivo', archivo)
    return http.post<ArchivoSubidoDto>('/archivos', form)
  },
}
