import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService, type LoginPayload } from '../services/auth.service'

/** Store de autenticación: mantiene el JWT y los datos básicos de la sesión. */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const rol = ref<string | null>(localStorage.getItem('rol'))
  const nombre = ref<string | null>(localStorage.getItem('nombre'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(payload: LoginPayload) {
    const { data } = await authService.login(payload)
    token.value = data.token
    rol.value = data.rol
    nombre.value = data.nombreMostrado
    localStorage.setItem('token', data.token)
    localStorage.setItem('rol', data.rol)
    localStorage.setItem('nombre', data.nombreMostrado)
  }

  function logout() {
    token.value = null
    rol.value = null
    nombre.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombre')
  }

  return { token, rol, nombre, isAuthenticated, login, logout }
})
