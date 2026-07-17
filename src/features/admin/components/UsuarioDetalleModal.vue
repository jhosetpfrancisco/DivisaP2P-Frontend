<script setup lang="ts">
import { BaseBadge } from '@/components/ui'
import {
  formatFecha,
  etiquetaEstado,
  estadoUsuarioVariant,
} from '@/shared/utils/format'
import type { UsuarioAdminDto } from '../services/admin.service'

defineProps<{ usuario: UsuarioAdminDto | null }>()
const open = defineModel<boolean>({ required: true })

const ETIQUETAS_ROL: Record<string, string> = {
  USU: 'Usuario',
  ETU: 'Empresa de turismo',
  ADM: 'Administrador',
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && usuario"
      class="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      role="dialog"
      aria-modal="true"
      @click.self="open = false"
    >
      <div class="w-full max-w-lg rounded-base border border-border bg-surface p-5 shadow-lg">
        <div class="mb-4 flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-foreground">
              {{ usuario.razonSocial ?? `${usuario.nombres} ${usuario.apellidoPaterno ?? ''}`.trim() }}
            </h3>
            <p class="text-sm text-foreground-soft">{{ usuario.correo }}</p>
          </div>
          <BaseBadge :variant="estadoUsuarioVariant(usuario.estado)">
            {{ etiquetaEstado(usuario.estado) }}
          </BaseBadge>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt class="text-foreground-soft">Rol</dt>
            <dd class="text-foreground">{{ ETIQUETAS_ROL[usuario.rol] ?? usuario.rol }}</dd>
          </div>
          <div v-if="usuario.ruc">
            <dt class="text-foreground-soft">RUC</dt>
            <dd class="text-foreground">{{ usuario.ruc }}</dd>
          </div>
          <div v-if="usuario.numeroDocumento">
            <dt class="text-foreground-soft">{{ usuario.tipoDocumento }}</dt>
            <dd class="text-foreground">{{ usuario.numeroDocumento }}</dd>
          </div>
          <div v-if="usuario.celular">
            <dt class="text-foreground-soft">Celular</dt>
            <dd class="text-foreground">{{ usuario.celular }}</dd>
          </div>
          <div>
            <dt class="text-foreground-soft">Calificación</dt>
            <dd class="text-foreground">
              {{ usuario.calificacionPromedio }} ({{ usuario.operacionesCompletadas }} ops)
            </dd>
          </div>
          <div>
            <dt class="text-foreground-soft">Correo verificado</dt>
            <dd class="text-foreground">{{ usuario.correoVerificado ? 'Sí' : 'No' }}</dd>
          </div>
          <div>
            <dt class="text-foreground-soft">Registro</dt>
            <dd class="text-foreground">{{ formatFecha(usuario.fechaRegistro) }}</dd>
          </div>
        </dl>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-base border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
            @click="open = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
