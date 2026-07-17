<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseInput, BaseCard } from '@/components/ui'
import { authService, type RegistroEmpresaPayload } from '../services/auth.service'

const form = reactive<RegistroEmpresaPayload>({
  razonSocial: '',
  ruc: '',
  representanteLegal: '',
  correo: '',
  password: '',
  celular: '',
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const serverError = ref('')
const exito = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
// RUC peruano: 11 dígitos que empiezan con 10, 15, 17 o 20.
const RUC_RE = /^(10|15|17|20)\d{9}$/

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.razonSocial.trim()) errors.razonSocial = 'Ingresa la razón social'
  if (!RUC_RE.test(form.ruc)) errors.ruc = 'El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20'
  if (!form.representanteLegal.trim()) errors.representanteLegal = 'Ingresa el representante legal'
  if (!EMAIL_RE.test(form.correo)) errors.correo = 'Correo corporativo no válido'
  if (!PASSWORD_RE.test(form.password))
    errors.password = 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'
  if (!form.celular.trim()) errors.celular = 'Ingresa un teléfono de contacto'

  return Object.keys(errors).length === 0
}

async function onSubmit() {
  serverError.value = ''
  if (!validar()) return

  loading.value = true
  try {
    await authService.registrarEmpresa({ ...form })
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
        Registro de empresa en Divisa<span class="text-brand-600">P2P</span>
      </h1>
      <p class="mt-1 text-sm text-foreground-soft">
        Para empresas de turismo con montos y beneficios diferenciados.
      </p>
    </header>

    <BaseCard>
      <div v-if="exito" class="text-center">
        <p class="mb-4 text-sm text-foreground">
          ✅ Solicitud enviada. Tu cuenta quedó <strong>pendiente de aprobación</strong>; un
          administrador la revisará y te avisaremos cuando puedas iniciar sesión.
        </p>
        <RouterLink to="/login">
          <BaseButton variant="primary" block>Volver a iniciar sesión</BaseButton>
        </RouterLink>
      </div>

      <form v-else class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.razonSocial"
          label="Razón social"
          :error="errors.razonSocial"
          required
        />
        <BaseInput
          v-model="form.ruc"
          label="RUC"
          placeholder="20XXXXXXXXX"
          inputmode="numeric"
          :maxlength="11"
          :error="errors.ruc"
          required
        />
        <BaseInput
          v-model="form.representanteLegal"
          label="Representante legal"
          :error="errors.representanteLegal"
          required
        />
        <BaseInput
          v-model="form.correo"
          label="Correo corporativo"
          type="email"
          placeholder="contacto@empresa.com"
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
        <BaseInput
          v-model="form.celular"
          label="Teléfono de contacto"
          :error="errors.celular"
          required
        />

        <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>

        <BaseButton type="submit" variant="primary" block :disabled="loading">
          {{ loading ? 'Enviando solicitud…' : 'Registrar empresa' }}
        </BaseButton>

        <p class="text-center text-sm text-foreground-soft">
          ¿Eres persona natural?
          <RouterLink to="/registro" class="font-medium text-brand-600 hover:underline">
            Regístrate como usuario
          </RouterLink>
        </p>
      </form>
    </BaseCard>
  </div>
</template>
