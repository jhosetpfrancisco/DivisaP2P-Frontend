<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { BaseCard, BaseBadge, BaseButton, BaseTextarea } from '@/components/ui'
import { formatFecha, estadoDisputaVariant, etiquetaResolucion } from '@/shared/utils/format'
import { urlArchivo } from '@/shared/utils/archivo'
import {
  disputasService,
  type DisputaDto,
  type ResolucionDisputaPayload,
} from '../services/disputas.service'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const disputa = ref<DisputaDto | null>(null)
const loading = ref(true)

const form = reactive<{ resolucion: ResolucionDisputaPayload['resolucion'] | ''; comentario: string }>({
  resolucion: '',
  comentario: '',
})
const errors = reactive<Record<string, string>>({})
const serverError = ref('')
const enviando = ref(false)

const resolucionOpts = [
  { value: 'AFavorComprador', label: 'A favor del comprador' },
  { value: 'AFavorVendedor', label: 'A favor del vendedor' },
  { value: 'Anulada', label: 'Anulada' },
] as const

const puedeResolver = computed(() => disputa.value?.estado === 'Abierta')

async function cargar() {
  loading.value = true
  try {
    disputa.value = (await disputasService.obtener(id)).data
  } finally {
    loading.value = false
  }
}

function validar(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.resolucion) errors.resolucion = 'Selecciona una resolución'
  const largo = form.comentario.trim().length
  if (largo < 50)
    errors.comentario = 'El comentario debe justificar la decisión (mínimo 50 caracteres)'
  else if (largo > 1000) errors.comentario = 'El comentario no puede superar 1000 caracteres'
  return Object.keys(errors).length === 0
}

async function resolver() {
  serverError.value = ''
  if (!validar() || !form.resolucion) return
  enviando.value = true
  try {
    await disputasService.resolver(id, {
      resolucion: form.resolucion,
      comentario: form.comentario.trim(),
    })
    router.push('/app/admin/disputas')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { mensaje?: string } } }
    serverError.value = err.response?.data?.mensaje ?? 'No se pudo registrar la resolución'
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink to="/app/admin/disputas" class="mb-4 inline-block text-sm text-brand-600 hover:underline">
      ← Volver a la bandeja
    </RouterLink>

    <p v-if="loading" class="text-sm text-foreground-soft">Cargando…</p>
    <p v-else-if="!disputa" class="text-sm text-foreground-soft">Disputa no encontrada.</p>

    <template v-else>
      <BaseCard :title="`Disputa · ${disputa.transaccionCodigo}`" class="mb-5">
        <div class="mb-3">
          <BaseBadge :variant="estadoDisputaVariant(disputa.estado)">{{ disputa.estado }}</BaseBadge>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <p><strong class="text-foreground">Abierta por (usuario):</strong> #{{ disputa.abiertaPorId }}</p>
          <p><strong class="text-foreground">Apertura:</strong> {{ formatFecha(disputa.fechaApertura) }}</p>
        </div>
        <div class="mt-3">
          <p class="text-sm font-medium text-foreground">Motivo</p>
          <p class="text-sm text-foreground-soft">{{ disputa.motivo }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Evidencias" class="mb-5">
        <p v-if="!disputa.evidencias.length" class="text-sm text-foreground-soft">
          La parte no adjuntó evidencias.
        </p>
        <ul v-else class="flex flex-col gap-2 text-sm">
          <li
            v-for="(ev, i) in disputa.evidencias"
            :key="i"
            class="rounded-base border border-border px-3 py-2"
          >
            <a :href="urlArchivo(ev)" target="_blank" rel="noopener" class="text-brand-600 hover:underline">
              {{ ev.split('/').pop() }}
            </a>
          </li>
        </ul>
      </BaseCard>

      <!-- Resolución: formulario si está abierta, o el detalle si ya se resolvió. -->
      <BaseCard v-if="puedeResolver" title="Resolver disputa">
        <div class="flex flex-col gap-4">
          <div>
            <span class="mb-1 block text-sm font-medium text-foreground">Resolución</span>
            <div class="flex flex-col gap-2">
              <label v-for="opt in resolucionOpts" :key="opt.value" class="flex items-center gap-2">
                <input v-model="form.resolucion" type="radio" :value="opt.value" />
                <span class="text-sm text-foreground">{{ opt.label }}</span>
              </label>
            </div>
            <span v-if="errors.resolucion" class="mt-1 block text-xs text-danger">{{ errors.resolucion }}</span>
          </div>

          <BaseTextarea
            v-model="form.comentario"
            label="Comentario de la resolución"
            placeholder="Justifica la decisión (mínimo 50 caracteres)"
            :rows="4"
            :maxlength="1000"
            :error="errors.comentario"
            required
          />

          <p v-if="serverError" class="text-sm text-danger">{{ serverError }}</p>

          <div>
            <BaseButton variant="primary" :disabled="enviando" @click="resolver">
              {{ enviando ? 'Registrando…' : 'Registrar resolución' }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-else title="Resolución">
        <p class="text-sm">
          <strong class="text-foreground">Decisión:</strong>
          {{ etiquetaResolucion(disputa.resolucion) }}
        </p>
        <p class="mt-1 text-sm">
          <strong class="text-foreground">Resuelta el:</strong>
          {{ formatFecha(disputa.fechaResolucion) }}
        </p>
        <p v-if="disputa.comentarioResolucion" class="mt-2 text-sm text-foreground-soft">
          {{ disputa.comentarioResolucion }}
        </p>
      </BaseCard>
    </template>
  </div>
</template>
