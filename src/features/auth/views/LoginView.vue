<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { BaseButton, BaseInput, BaseCard } from '@/components/ui'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ correo: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ ...form })
    router.push('/')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    error.value = err.response?.data?.mensaje ?? 'No se pudo iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md px-6 py-16">
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-foreground">
        Divisa<span class="text-brand-600">P2P</span>
      </h1>
      <p class="mt-1 text-sm text-foreground-soft">Inicia sesión para continuar.</p>
    </header>

    <BaseCard>
      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.correo"
          label="Correo"
          type="email"
          placeholder="tu@correo.com"
          required
        />
        <BaseInput v-model="form.password" label="Contraseña" type="password" required />

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <BaseButton type="submit" variant="primary" block :disabled="loading">
          {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
        </BaseButton>

        <p class="text-center text-sm text-foreground-soft">
          ¿No tienes cuenta?
          <RouterLink to="/registro" class="font-medium text-brand-600 hover:underline">
            Regístrate
          </RouterLink>
        </p>
      </form>
    </BaseCard>
  </div>
</template>
