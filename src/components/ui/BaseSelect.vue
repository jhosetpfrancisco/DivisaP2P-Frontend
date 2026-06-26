<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

defineProps<{
  label?: string
  options: Option[]
  placeholder?: string
  error?: string
  required?: boolean
}>()

const model = defineModel<string | number>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-foreground">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </span>
    <select
      v-model="model"
      class="w-full rounded-base border bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      :class="error ? 'border-danger' : 'border-border'"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </label>
</template>
