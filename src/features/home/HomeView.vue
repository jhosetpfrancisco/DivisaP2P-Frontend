<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseButton,
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseCheckbox,
  BaseCard,
  BaseBadge,
} from '@/components/ui'

// Estado local solo para el smoke-test del design system.
const correo = ref('')
const comentario = ref('')
const divisa = ref('')
const acepta = ref(false)

const divisas = [
  { label: 'PEN', value: 'PEN' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-12">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-foreground">
        Divisa<span class="text-brand-600">P2P</span>
      </h1>
      <p class="mt-2 text-foreground-soft">
        Plataforma P2P de intercambio de divisas — base del frontend.
      </p>
    </header>

    <BaseCard title="Librería de componentes (design tokens)">
      <div class="flex flex-col gap-4">
        <BaseInput v-model="correo" label="Correo" type="email" placeholder="tu@correo.com" required />
        <BaseSelect v-model="divisa" label="Divisa" :options="divisas" placeholder="Selecciona…" />
        <BaseTextarea v-model="comentario" label="Comentario" placeholder="Escribe algo…" />
        <BaseCheckbox v-model="acepta" label="Acepto los términos y condiciones" />

        <div class="flex flex-wrap items-center gap-2">
          <BaseButton variant="primary">Primario</BaseButton>
          <BaseButton variant="secondary">Secundario</BaseButton>
          <BaseButton variant="ghost">Ghost</BaseButton>
          <BaseButton variant="danger">Peligro</BaseButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <BaseBadge variant="success">Activa</BaseBadge>
          <BaseBadge variant="warning">Pendiente</BaseBadge>
          <BaseBadge variant="danger">En disputa</BaseBadge>
          <BaseBadge variant="info">Completada</BaseBadge>
          <BaseBadge>Neutral</BaseBadge>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
