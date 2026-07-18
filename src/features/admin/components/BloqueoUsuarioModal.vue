<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { BaseModal, BaseTextarea } from '@/components/ui'
import { adminService } from '../services/admin.service'

// Componente modal para confirmar y registrar el bloqueo administrativo de una cuenta.
// Props: identifican al usuario que sera bloqueado y el nombre mostrado en el mensaje.
const props = defineProps<{
  // Identificador usado por el servicio para aplicar el bloqueo.
  usuarioId: number
  // Nombre visible del usuario afectado por la accion.
  nombre: string
}>()

// Emits: notifica al componente padre que el bloqueo termino correctamente.
const emit = defineEmits<{ bloqueado: [] }>()
// Modelo v-model que controla la apertura y cierre del modal.
const open = defineModel<boolean>({ required: true })

// Motivo ingresado por el administrador para justificar el bloqueo.
const motivo = ref('')
// Errores de validacion del formulario, indexados por nombre de campo.
const errors = reactive<Record<string, string>>({})
// Mensaje devuelto por el servidor cuando la operacion falla.
const serverError = ref('')
// Indica si la solicitud de bloqueo esta en curso.
const loading = ref(false)

// Watcher de ciclo reactivo: limpia el formulario cada vez que el modal se abre.
watch(open, (abierto) => {
  if (abierto) {
    motivo.value = ''
    serverError.value = ''
    Object.keys(errors).forEach((k) => delete errors[k])
  }
})

// Lifecycle hooks: no declara hooks; el reseteo al abrir se maneja con el watcher anterior.
// Valida la longitud del motivo antes de permitir el envio al servidor.
function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  const largo = motivo.value.trim().length
  if (largo < 30) errors.motivo = 'El motivo debe tener al menos 30 caracteres'
  else if (largo > 300) errors.motivo = 'El motivo no puede superar 300 caracteres'
  return Object.keys(errors).length === 0
}

// Ejecuta el bloqueo, cierra el modal y emite el evento de exito al finalizar.
async function confirmar() {
  serverError.value = ''
  if (!validar()) return
  loading.value = true
  try {
    await adminService.bloquear(props.usuarioId, motivo.value.trim())
    open.value = false
    emit('bloqueado')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo bloquear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="open"
    title="Bloquear cuenta"
    confirm-label="Bloquear cuenta"
    variant="danger"
    :loading="loading"
    @confirmar="confirmar"
  >
    <div class="flex flex-col gap-4">
      <p>
        Vas a bloquear a <strong class="text-foreground">{{ nombre }}</strong>. No podrá iniciar
        sesión, publicar ofertas ni iniciar transacciones hasta que lo desbloquees.
      </p>

      <BaseTextarea
        v-model="motivo"
        label="Motivo del bloqueo"
        placeholder="Explica el motivo del bloqueo (mínimo 30 caracteres)"
        :rows="3"
        :maxlength="300"
        :error="errors.motivo"
        required
      />

      <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>
    </div>
  </BaseModal>
</template>
