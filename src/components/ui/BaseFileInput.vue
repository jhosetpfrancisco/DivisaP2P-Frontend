<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { extensionDe, formatPeso, validarAdjunto } from '@/shared/utils/archivo'

const props = withDefaults(
  defineProps<{
    label?: string
    /** Cantidad máxima de archivos (US-009 permite 1, US-014 hasta 3). */
    max?: number
    error?: string
    required?: boolean
  }>(),
  { max: 1 },
)

const model = defineModel<File[]>({ default: () => [] })

const input = ref<HTMLInputElement | null>(null)
const errorArchivo = ref('')

// Las URL de preview se revocan al quitar el archivo para no filtrar memoria.
const previews = new Map<File, string>()

function previewDe(archivo: File): string {
  if (!previews.has(archivo)) previews.set(archivo, URL.createObjectURL(archivo))
  return previews.get(archivo) as string
}

function esImagen(archivo: File): boolean {
  return extensionDe(archivo.name) !== 'pdf'
}

const lleno = computed(() => model.value.length >= props.max)

function onChange(e: Event) {
  errorArchivo.value = ''
  const seleccionados = Array.from((e.target as HTMLInputElement).files ?? [])

  for (const archivo of seleccionados) {
    if (model.value.length >= props.max) {
      errorArchivo.value = `Solo puedes adjuntar ${props.max} archivo${props.max > 1 ? 's' : ''}.`
      break
    }
    const invalido = validarAdjunto(archivo)
    if (invalido) {
      errorArchivo.value = invalido
      continue
    }
    model.value = [...model.value, archivo]
  }

  // Se limpia el input para poder volver a elegir el mismo archivo tras quitarlo.
  if (input.value) input.value.value = ''
}

function quitar(archivo: File) {
  const url = previews.get(archivo)
  if (url) {
    URL.revokeObjectURL(url)
    previews.delete(archivo)
  }
  model.value = model.value.filter((a) => a !== archivo)
  errorArchivo.value = ''
}

onBeforeUnmount(() => {
  previews.forEach((url) => URL.revokeObjectURL(url))
  previews.clear()
})
</script>

<template>
  <div>
    <span v-if="label" class="mb-1 block text-sm font-medium text-foreground">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </span>

    <label
      v-if="!lleno"
      class="flex cursor-pointer flex-col items-center justify-center rounded-base border border-dashed px-4 py-5 text-center transition hover:bg-surface-muted"
      :class="error || errorArchivo ? 'border-danger' : 'border-border'"
    >
      <input
        ref="input"
        type="file"
        class="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        :multiple="max > 1"
        @change="onChange"
      />
      <span class="text-sm font-medium text-brand-600">Selecciona un archivo</span>
      <span class="mt-0.5 text-xs text-foreground-soft">JPG, PNG o PDF · máximo 5 MB</span>
    </label>

    <ul v-if="model.length" class="mt-2 flex flex-col gap-2">
      <li
        v-for="archivo in model"
        :key="archivo.name + archivo.size"
        class="flex items-center gap-3 rounded-base border border-border px-3 py-2"
      >
        <img
          v-if="esImagen(archivo)"
          :src="previewDe(archivo)"
          alt=""
          class="h-10 w-10 rounded object-cover"
        />
        <span
          v-else
          class="flex h-10 w-10 items-center justify-center rounded bg-surface-muted text-xs font-semibold text-foreground-soft"
        >
          PDF
        </span>

        <span class="min-w-0 flex-1">
          <a
            :href="previewDe(archivo)"
            target="_blank"
            rel="noopener"
            class="block truncate text-sm font-medium text-brand-600 hover:underline"
          >
            {{ archivo.name }}
          </a>
          <span class="text-xs text-foreground-soft">{{ formatPeso(archivo.size) }}</span>
        </span>

        <button
          type="button"
          class="text-sm text-foreground-soft transition hover:text-danger"
          @click="quitar(archivo)"
        >
          Quitar
        </button>
      </li>
    </ul>

    <span v-if="error || errorArchivo" class="mt-1 block text-xs text-danger">
      {{ error || errorArchivo }}
    </span>
  </div>
</template>
