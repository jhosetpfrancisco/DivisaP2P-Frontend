<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { BaseButton, BaseInput, BaseSelect, BaseCheckbox, BaseCard, BaseBadge } from '@/components/ui'
import {
  perfilService,
  type PerfilDto,
  type CuentaBancariaDto,
  type CuentaBancariaCreatePayload,
} from '../services/perfil.service'

const perfil = ref<PerfilDto | null>(null)
const cuentas = ref<CuentaBancariaDto[]>([])

const datos = reactive({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  celular: '',
  notificacionesCorreo: true,
})
const datosMsg = ref('')

const pass = reactive({ passwordActual: '', passwordNueva: '' })
const passMsg = ref('')

const nuevaCuenta = reactive<CuentaBancariaCreatePayload>({
  banco: '',
  tipoCuenta: 'Ahorros',
  divisa: 'PEN',
  numeroCuenta: '',
  cci: '',
  nombreTitular: '',
  esPredeterminada: false,
})
const cuentaMsg = ref('')

const bancos = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'BanBif', 'Pichincha'].map((b) => ({
  label: b,
  value: b,
}))
const tiposCuenta = [
  { label: 'Ahorros', value: 'Ahorros' },
  { label: 'Corriente', value: 'Corriente' },
]
const divisas = [
  { label: 'PEN', value: 'PEN' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

async function cargar() {
  const { data } = await perfilService.obtener()
  perfil.value = data
  datos.nombres = data.nombres
  datos.apellidoPaterno = data.apellidoPaterno ?? ''
  datos.apellidoMaterno = data.apellidoMaterno ?? ''
  datos.celular = data.celular
  datos.notificacionesCorreo = data.notificacionesCorreo
  cuentas.value = (await perfilService.listarCuentas()).data
}

async function guardarDatos() {
  datosMsg.value = ''
  const { data } = await perfilService.actualizar({ ...datos })
  datosMsg.value = data.mensaje
}

async function cambiarPassword() {
  passMsg.value = ''
  const { data } = await perfilService.cambiarPassword({ ...pass })
  passMsg.value = data.mensaje
  pass.passwordActual = ''
  pass.passwordNueva = ''
}

async function agregarCuenta() {
  cuentaMsg.value = ''
  if (!/^\d{20}$/.test(nuevaCuenta.cci)) {
    cuentaMsg.value = 'El CCI debe tener 20 dígitos'
    return
  }
  await perfilService.crearCuenta({ ...nuevaCuenta })
  cuentas.value = (await perfilService.listarCuentas()).data
  Object.assign(nuevaCuenta, {
    banco: '',
    tipoCuenta: 'Ahorros',
    divisa: 'PEN',
    numeroCuenta: '',
    cci: '',
    nombreTitular: '',
    esPredeterminada: false,
  })
}

async function eliminarCuenta(id: number) {
  await perfilService.eliminarCuenta(id)
  cuentas.value = cuentas.value.filter((c) => c.id !== id)
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-2xl font-bold text-foreground">Mi perfil</h1>

    <div class="flex flex-col gap-6">
      <!-- Datos personales -->
      <BaseCard title="Datos personales">
        <div v-if="perfil" class="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-foreground-soft">
          <span>Correo: <strong class="text-foreground">{{ perfil.correo }}</strong></span>
          <span v-if="perfil.numeroDocumento">
            {{ perfil.tipoDocumento }}: <strong class="text-foreground">{{ perfil.numeroDocumento }}</strong>
          </span>
          <span>
            Calificación:
            <strong class="text-foreground">{{ perfil.calificacionPromedio }}</strong>
            ({{ perfil.operacionesCompletadas }} ops)
          </span>
          <BaseBadge :variant="perfil.estado === 'Activo' ? 'success' : 'warning'">
            {{ perfil.estado }}
          </BaseBadge>
        </div>

        <form class="flex flex-col gap-3" @submit.prevent="guardarDatos">
          <BaseInput v-model="datos.nombres" label="Nombres" required />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="datos.apellidoPaterno" label="Apellido paterno" />
            <BaseInput v-model="datos.apellidoMaterno" label="Apellido materno" />
          </div>
          <BaseInput v-model="datos.celular" label="Celular" required />
          <BaseCheckbox
            v-model="datos.notificacionesCorreo"
            label="Recibir notificaciones por correo (las de la app siempre están activas)"
          />
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary">Guardar cambios</BaseButton>
            <span v-if="datosMsg" class="text-sm text-success">{{ datosMsg }}</span>
          </div>
        </form>
      </BaseCard>

      <!-- Cambio de contraseña -->
      <BaseCard title="Cambiar contraseña">
        <form class="flex flex-col gap-3" @submit.prevent="cambiarPassword">
          <BaseInput v-model="pass.passwordActual" label="Contraseña actual" type="password" required />
          <BaseInput v-model="pass.passwordNueva" label="Contraseña nueva" type="password" required />
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="secondary">Actualizar contraseña</BaseButton>
            <span v-if="passMsg" class="text-sm text-success">{{ passMsg }}</span>
          </div>
        </form>
      </BaseCard>

      <!-- Cuentas bancarias -->
      <BaseCard title="Cuentas bancarias">
        <ul v-if="cuentas.length" class="mb-5 flex flex-col gap-2">
          <li
            v-for="c in cuentas"
            :key="c.id"
            class="flex items-center justify-between rounded-base border border-border px-3 py-2 text-sm"
          >
            <span>
              <strong class="text-foreground">{{ c.banco }}</strong>
              · {{ c.tipoCuenta }} · {{ c.divisa }} · {{ c.numeroCuenta }}
              <BaseBadge v-if="c.esPredeterminada" variant="info">Predeterminada</BaseBadge>
            </span>
            <BaseButton variant="ghost" @click="eliminarCuenta(c.id)">Eliminar</BaseButton>
          </li>
        </ul>
        <p v-else class="mb-5 text-sm text-foreground-soft">Aún no registras cuentas bancarias.</p>

        <form class="grid grid-cols-2 gap-3" @submit.prevent="agregarCuenta">
          <BaseSelect v-model="nuevaCuenta.banco" label="Banco" :options="bancos" placeholder="Selecciona…" />
          <BaseSelect v-model="nuevaCuenta.tipoCuenta" label="Tipo" :options="tiposCuenta" />
          <BaseSelect v-model="nuevaCuenta.divisa" label="Divisa" :options="divisas" />
          <BaseInput v-model="nuevaCuenta.numeroCuenta" label="N° de cuenta" />
          <BaseInput v-model="nuevaCuenta.cci" label="CCI (20 dígitos)" />
          <BaseInput v-model="nuevaCuenta.nombreTitular" label="Titular" />
          <div class="col-span-2 flex items-center justify-between">
            <BaseCheckbox v-model="nuevaCuenta.esPredeterminada" label="Marcar como predeterminada" />
            <BaseButton type="submit" variant="primary">Agregar cuenta</BaseButton>
          </div>
          <span v-if="cuentaMsg" class="col-span-2 text-sm text-danger">{{ cuentaMsg }}</span>
        </form>
      </BaseCard>
    </div>
  </div>
</template>
