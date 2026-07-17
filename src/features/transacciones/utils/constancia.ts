import { formatFecha, formatMonto, etiquetaEstado } from '@/shared/utils/format'
import type { TransaccionDetalleDto } from '../services/transacciones.service'

/**
 * US-011 — Genera la constancia de una transacción completada como documento HTML
 * autocontenido (imprimible / guardable), sin depender de un endpoint del backend.
 */
export function construirConstancia(tx: TransaccionDetalleDto): string {
  const filaHistorial = (estado: string, fecha: string, comentario: string | null) => `
    <tr>
      <td>${etiquetaEstado(estado)}</td>
      <td>${formatFecha(fecha)}</td>
      <td>${comentario ?? ''}</td>
    </tr>`

  const historial = tx.historial.map((h) => filaHistorial(h.estado, h.fecha, h.comentario)).join('')

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Constancia ${tx.codigo}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; max-width: 720px; margin: 40px auto; padding: 0 24px; }
    h1 { color: #059669; margin-bottom: 4px; }
    .sub { color: #64748b; margin-top: 0; }
    .estado { display: inline-block; background: #d1fae5; color: #047857; padding: 2px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
    th { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; }
    .datos td:first-child { color: #64748b; width: 40%; }
    footer { margin-top: 32px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <h1>DivisaP2P</h1>
  <p class="sub">Constancia de transacción</p>

  <h2>${tx.codigo} <span class="estado">${etiquetaEstado(tx.estado)}</span></h2>

  <table class="datos">
    <tbody>
      <tr><td>Comprador</td><td>${tx.compradorNombre}</td></tr>
      <tr><td>Vendedor</td><td>${tx.vendedorNombre}</td></tr>
      <tr><td>Par de divisas</td><td>${tx.divisaOrigen} &rarr; ${tx.divisaDestino}</td></tr>
      <tr><td>Monto operado</td><td>${formatMonto(tx.montoOperado, tx.divisaOrigen)}</td></tr>
      <tr><td>Tipo de cambio</td><td>${tx.tipoCambio}</td></tr>
      <tr><td>Inicio</td><td>${formatFecha(tx.fechaInicio)}</td></tr>
    </tbody>
  </table>

  <h3>Línea de tiempo</h3>
  <table>
    <thead><tr><th>Estado</th><th>Fecha</th><th>Comentario</th></tr></thead>
    <tbody>${historial}</tbody>
  </table>

  <footer>Documento generado por la plataforma DivisaP2P para la transacción ${tx.codigo}.</footer>
</body>
</html>`
}
