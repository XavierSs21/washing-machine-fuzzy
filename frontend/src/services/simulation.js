import api from './api'

/**
 * POST /api/simulate
 * Retorna: { prelavado, lavado, enjuague, centrifugado, tiempo_total }
 */
export const runSimulation = (tipo_ropa, nivel_suciedad, masa_ropa) =>
  api.post('/api/simulate', { tipo_ropa, nivel_suciedad, masa_ropa })
     .then(r => r.data)

/**
 * GET /api/cycles
 * Retorna metadata de los 4 ciclos con colores para el frontend
 */
export const getCycles = () =>
  api.get('/api/cycles').then(r => r.data)

/**
 * GET /api/membership
 * Retorna funciones de membresía para los charts de Aaly
 */
export const getMembership = () =>
  api.get('/api/membership').then(r => r.data)
