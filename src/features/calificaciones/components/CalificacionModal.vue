<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseModal, BaseStars, BaseTextarea } from '@/components/ui'
import { calificacionesService } from '../services/calificaciones.service'

const props = defineProps<{
  transaccionId: number
  /** Nombre de la contraparte a calificar (solo para el texto del modal). */
  contraparte: string
}>()

const emit = defineEmits<{ calificado: [] }>()
const open = defineModel<boolean>({ required: true })

const form = reactive({ estrellas: 0, comentario: '' })
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const loading = ref(false)

watch(open, (abierto) => {
  if (abierto) {
    form.estrellas = 0
    form.comentario = ''
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (form.estrellas < 1 || form.estrellas > 5) errors.estrellas = 'Selecciona de 1 a 5 estrellas'
  if (form.comentario.length > 200) errors.comentario = 'El comentario no puede superar 200 caracteres'
  return Object.keys(errors).length === 0
}

async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await calificacionesService.crear({
      transaccionId: props.transaccionId,
      estrellas: form.estrellas,
      comentario: form.comentario.trim() || undefined,
    })
    open.value = false
    emit('calificado')
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { mensaje?: string } } }
    // 409 = ya se había calificado esta transacción: se trata como hecho, se cierra y se oculta el botón.
    if (err.response?.status === 409) {
      open.value = false
      emit('calificado')
      return
    }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo registrar la calificación'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    title="Calificar contraparte"
    confirm-label="Enviar calificación"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <p>
        Comparte tu experiencia con
        <strong class="text-foreground">{{ contraparte }}</strong> en esta transacción.
      </p>

      <BaseStars v-model="form.estrellas" label="Calificación" :error="errors.estrellas" />

      <BaseTextarea
        v-model="form.comentario"
        label="Comentario (opcional)"
        placeholder="Cuéntanos cómo fue la operación (máximo 200 caracteres)"
        :rows="3"
        :maxlength="200"
        :error="errors.comentario"
      />
      <p class="-mt-2 text-right text-xs text-foreground-soft">{{ form.comentario.length }}/200</p>

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
