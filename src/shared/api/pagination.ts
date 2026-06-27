/** Forma estándar de las respuestas paginadas de la API DivisaP2P. */
export interface Paginado<T> {
  data: T[]
  total: number
  pagina: number
  tamanioPagina: number
  totalPaginas: number
}
