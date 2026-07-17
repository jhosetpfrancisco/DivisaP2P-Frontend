import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService, type LoginPayload } from '../services/auth.service'

/** Store de autenticación: mantiene el JWT y los datos básicos de la sesión. */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const rol = ref<string | null>(localStorage.getItem('rol'))
  const nombre = ref<string | null>(localStorage.getItem('nombre'))
  // Necesario para saber de qué lado de una transacción está el usuario (comprador o vendedor).
  // Comprobación explícita para no perder el id 0 (que sería falsy con `|| null`).
  const usuarioIdGuardado = localStorage.getItem('usuarioId')
  const usuarioId = ref<number | null>(
    usuarioIdGuardado !== null && usuarioIdGuardado !== '' ? Number(usuarioIdGuardado) : null,
  )

  const isAuthenticated = computed(() => !!token.value)
  const esAdmin = computed(() => rol.value === 'ADM')
  const esEmpresa = computed(() => rol.value === 'ETU')

  async function login(payload: LoginPayload) {
    const { data } = await authService.login(payload)
    token.value = data.token
    rol.value = data.rol
    nombre.value = data.nombreMostrado
    usuarioId.value = data.usuarioId
    localStorage.setItem('token', data.token)
    localStorage.setItem('rol', data.rol)
    localStorage.setItem('nombre', data.nombreMostrado)
    localStorage.setItem('usuarioId', String(data.usuarioId))
  }

  function logout() {
    token.value = null
    rol.value = null
    nombre.value = null
    usuarioId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombre')
    localStorage.removeItem('usuarioId')
  }

  return { token, rol, nombre, usuarioId, isAuthenticated, esAdmin, esEmpresa, login, logout }
})
