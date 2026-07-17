<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { BaseButton, BaseSelect, BaseInput, BaseCard, BaseBadge } from '@/components/ui'
import { formatFecha, etiquetaEstado, estadoUsuarioVariant } from '@/shared/utils/format'
import BloqueoUsuarioModal from '../components/BloqueoUsuarioModal.vue'
import UsuarioDetalleModal from '../components/UsuarioDetalleModal.vue'
import { adminService, type UsuarioAdminDto } from '../services/admin.service'

const filtros = reactive({ rol: '', estado: '', calificacionMin: '' })
const items = ref<UsuarioAdminDto[]>([])
const total = ref(0)
const pagina = ref(1)
const tamanioPagina = 10
const totalPaginas = ref(1)
const loading = ref(false)

const seleccionado = ref<UsuarioAdminDto | null>(null)
const detalleModal = ref(false)
const bloqueoModal = ref(false)

const rolOpts = [
  { label: 'Todos', value: '' },
  { label: 'Usuario', value: 'USU' },
  { label: 'Empresa de turismo', value: 'ETU' },
  { label: 'Administrador', value: 'ADM' },
]
const estadoOpts = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'Activo' },
  { label: 'Bloqueado', value: 'Bloqueado' },
  { label: 'Pendiente de verificación', value: 'PendienteVerificacion' },
  { label: 'Pendiente de aprobación', value: 'PendienteAprobacion' },
]

function nombreDe(u: UsuarioAdminDto): string {
  return u.razonSocial ?? `${u.nombres} ${u.apellidoPaterno ?? ''}`.trim()
}

// La empresa pendiente de aprobación es la única que muestra el botón "Aprobar".
function esEmpresaPendiente(u: UsuarioAdminDto): boolean {
  return u.rol === 'ETU' && u.estado === 'PendienteAprobacion'
}

async function cargar() {
  loading.value = true
  try {
    const { data } = await adminService.usuarios({
      rol: filtros.rol || undefined,
      estado: filtros.estado || undefined,
      calificacionMin: filtros.calificacionMin.trim() === '' ? undefined : Number(filtros.calificacionMin),
      pagina: pagina.value,
      tamanioPagina,
    })
    items.value = data.data
    total.value = data.total
    totalPaginas.value = data.totalPaginas
  } finally {
    loading.value = false
  }
}

function aplicar() {
  pagina.value = 1
  cargar()
}

function irPagina(p: number) {
  if (p < 1 || p > totalPaginas.value) return
  pagina.value = p
  cargar()
}

function verDetalle(u: UsuarioAdminDto) {
  seleccionado.value = u
  detalleModal.value = true
}

function abrirBloqueo(u: UsuarioAdminDto) {
  seleccionado.value = u
  bloqueoModal.value = true
}

async function desbloquear(u: UsuarioAdminDto) {
  await adminService.desbloquear(u.id)
  cargar()
}

async function aprobar(u: UsuarioAdminDto) {
  await adminService.aprobarEmpresa(u.id)
  cargar()
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <h1 class="mb-6 text-2xl font-bold text-foreground">Gestión de usuarios</h1>

    <BaseCard class="mb-5">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BaseSelect v-model="filtros.rol" label="Rol" :options="rolOpts" />
        <BaseSelect v-model="filtros.estado" label="Estado" :options="estadoOpts" />
        <BaseInput v-model="filtros.calificacionMin" label="Calif. mín." type="number" />
        <div class="flex items-end">
          <BaseButton variant="primary" @click="aplicar">Filtrar</BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
      <p v-else-if="!items.length" class="text-sm text-foreground-soft">No hay usuarios que coincidan.</p>

      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-border text-xs uppercase text-foreground-soft">
          <tr>
            <th class="py-2">Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Calif.</th>
            <th>Estado</th>
            <th>Registro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id" class="border-b border-border/60">
            <td class="py-3 font-medium text-foreground">{{ nombreDe(u) }}</td>
            <td class="text-foreground-soft">{{ u.correo }}</td>
            <td>{{ u.rol }}</td>
            <td>{{ u.calificacionPromedio }}</td>
            <td>
              <BaseBadge :variant="estadoUsuarioVariant(u.estado)">{{ etiquetaEstado(u.estado) }}</BaseBadge>
            </td>
            <td class="text-foreground-soft">{{ formatFecha(u.fechaRegistro).slice(0, 10) }}</td>
            <td class="py-2 text-right">
              <div class="flex justify-end gap-1">
                <BaseButton variant="ghost" @click="verDetalle(u)">Ver</BaseButton>
                <BaseButton v-if="esEmpresaPendiente(u)" variant="primary" @click="aprobar(u)">
                  Aprobar
                </BaseButton>
                <BaseButton
                  v-if="u.estado === 'Bloqueado'"
                  variant="secondary"
                  @click="desbloquear(u)"
                >
                  Desbloquear
                </BaseButton>
                <BaseButton
                  v-else-if="u.rol !== 'ADM'"
                  variant="danger"
                  @click="abrirBloqueo(u)"
                >
                  Bloquear
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="items.length" class="mt-4 flex items-center justify-between text-sm text-foreground-soft">
        <span>{{ total }} usuarios · página {{ pagina }} de {{ totalPaginas }}</span>
        <div class="flex gap-2">
          <BaseButton variant="secondary" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">Anterior</BaseButton>
          <BaseButton variant="secondary" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente</BaseButton>
        </div>
      </div>
    </BaseCard>

    <UsuarioDetalleModal v-model="detalleModal" :usuario="seleccionado" />
    <BloqueoUsuarioModal
      v-if="seleccionado"
      v-model="bloqueoModal"
      :usuario-id="seleccionado.id"
      :nombre="nombreDe(seleccionado)"
      @bloqueado="cargar"
    />
  </div>
</template>
