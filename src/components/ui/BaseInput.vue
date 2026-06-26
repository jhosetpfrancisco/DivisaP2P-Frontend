<script setup lang="ts">
defineProps<{
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
}>()

const model = defineModel<string>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-foreground">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </span>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      class="w-full rounded-base border bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      :class="error ? 'border-danger' : 'border-border'"
    />
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </label>
</template>
