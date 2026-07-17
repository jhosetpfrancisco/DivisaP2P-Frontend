<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    readonly?: boolean
    /** Cantidad de operaciones a mostrar junto a la calificación (modo lectura). */
    operaciones?: number
    error?: string
  }>(),
  { readonly: false },
)

const model = defineModel<number>({ default: 0 })

// Estrella bajo el cursor: permite previsualizar la calificación antes de fijarla.
const hover = ref(0)

function seleccionar(valor: number) {
  if (props.readonly) return
  model.value = valor
}

/**
 * Una estrella se pinta llena si su posición no supera al valor mostrado.
 * En modo lectura el promedio es decimal (4.5), así que se redondea.
 */
function activa(posicion: number): boolean {
  const valor = hover.value || model.value
  return posicion <= (props.readonly ? Math.round(valor) : valor)
}
</script>

<template>
  <div>
    <span v-if="label" class="mb-1 block text-sm font-medium text-foreground">{{ label }}</span>

    <div class="flex items-center gap-1">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        :disabled="readonly"
        :aria-label="`${n} de 5 estrellas`"
        class="transition"
        :class="readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'"
        @click="seleccionar(n)"
        @mouseenter="!readonly && (hover = n)"
        @mouseleave="!readonly && (hover = 0)"
      >
        <svg
          class="h-5 w-5"
          :class="activa(n) ? 'text-warning' : 'text-border'"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85z"
          />
        </svg>
      </button>

      <span v-if="readonly" class="ml-1 text-sm text-foreground-soft">
        {{ model.toFixed(1) }}
        <template v-if="operaciones !== undefined">· {{ operaciones }} ops</template>
      </span>
    </div>

    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </div>
</template>
