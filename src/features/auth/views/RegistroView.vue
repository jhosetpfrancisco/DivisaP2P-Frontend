<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseInput, BaseSelect, BaseCheckbox, BaseCard } from '@/components/ui'
import { authService, type RegistroUsuarioPayload } from '../services/auth.service'

const form = reactive<RegistroUsuarioPayload>({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correo: '',
  password: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  celular: '',
  aceptaTerminos: false,
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const serverError = ref('')
const exito = ref(false)

const tipoDocOptions = [
  { label: 'DNI', value: 'DNI' },
  { label: 'Carné de extranjería (CE)', value: 'CE' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.nombres.trim()) errors.nombres = 'Ingresa tus nombres'
  if (!EMAIL_RE.test(form.correo)) errors.correo = 'Correo no válido'
  if (!PASSWORD_RE.test(form.password))
    errors.password = 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'

  const docLen = form.tipoDocumento === 'DNI' ? 8 : 9
  if (!new RegExp(`^\\d{${docLen}}$`).test(form.numeroDocumento))
    errors.numeroDocumento = `El ${form.tipoDocumento} debe tener ${docLen} dígitos`

  if (!form.celular.trim()) errors.celular = 'Ingresa tu celular'
  if (!form.aceptaTerminos) errors.aceptaTerminos = 'Debes aceptar los términos'

  return Object.keys(errors).length === 0
}

async function onSubmit() {
  serverError.value = ''
  if (!validar()) return

  loading.value = true
  try {
    await authService.registrar({ ...form })
    exito.value = true
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo completar el registro'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-6 py-10">
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-foreground">
        Crear cuenta en Divisa<span class="text-brand-600">P2P</span>
      </h1>
      <p class="mt-1 text-sm text-foreground-soft">Regístrate para comprar y vender divisas.</p>
    </header>

    <BaseCard>
      <div v-if="exito" class="text-center">
        <p class="mb-4 text-sm text-foreground">
          ✅ Registro exitoso. Te enviamos un correo de verificación (válido por 24 horas).
        </p>
        <RouterLink to="/login">
          <BaseButton variant="primary" block>Ir a iniciar sesión</BaseButton>
        </RouterLink>
      </div>

      <form v-else class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.nombres" label="Nombres" :error="errors.nombres" required />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="form.apellidoPaterno" label="Apellido paterno" />
          <BaseInput v-model="form.apellidoMaterno" label="Apellido materno" />
        </div>
        <BaseInput
          v-model="form.correo"
          label="Correo"
          type="email"
          placeholder="tu@correo.com"
          :error="errors.correo"
          required
        />
        <BaseInput
          v-model="form.password"
          label="Contraseña"
          type="password"
          :error="errors.password"
          required
        />
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect
            v-model="form.tipoDocumento"
            label="Tipo de documento"
            :options="tipoDocOptions"
          />
          <BaseInput
            v-model="form.numeroDocumento"
            label="N° de documento"
            :error="errors.numeroDocumento"
            required
          />
        </div>
        <BaseInput v-model="form.celular" label="Celular" :error="errors.celular" required />

        <div>
          <BaseCheckbox v-model="form.aceptaTerminos" label="Acepto los términos y condiciones" />
          <span v-if="errors.aceptaTerminos" class="mt-1 block text-xs text-danger">
            {{ errors.aceptaTerminos }}
          </span>
        </div>

        <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>

        <BaseButton type="submit" variant="primary" block :disabled="loading">
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </BaseButton>

        <p class="text-center text-sm text-foreground-soft">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="font-medium text-brand-600 hover:underline">
            Inicia sesión
          </RouterLink>
        </p>
        <p class="text-center text-sm text-foreground-soft">
          ¿Eres empresa de turismo?
          <RouterLink to="/registro-empresa" class="font-medium text-brand-600 hover:underline">
            Regístrala aquí
          </RouterLink>
        </p>
      </form>
    </BaseCard>
  </div>
</template>
