<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import BaseButton from './BaseButton.vue'

withDefaults(
  defineProps<{
    title: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'primary' | 'danger'
    loading?: boolean
  }>(),
  { confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', variant: 'primary', loading: false },
)

const emit = defineEmits<{ confirmar: [] }>()
const open = defineModel<boolean>({ required: true })

function cerrar() {
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cerrar()
}

// Mientras el modal está abierto se bloquea el scroll del fondo.
watch(open, (abierto) => {
  document.body.style.overflow = abierto ? 'hidden' : ''
  if (abierto) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      role="dialog"
      aria-modal="true"
      @click.self="cerrar"
    >
      <div class="w-full max-w-md rounded-base border border-border bg-surface p-5 shadow-lg">
        <h3 class="mb-3 text-base font-semibold text-foreground">{{ title }}</h3>

        <div class="text-sm text-foreground-soft">
          <slot />
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <BaseButton variant="secondary" :disabled="loading" @click="cerrar">
            {{ cancelLabel }}
          </BaseButton>
          <BaseButton :variant="variant" :disabled="loading" @click="emit('confirmar')">
            {{ loading ? 'Procesando…' : confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
