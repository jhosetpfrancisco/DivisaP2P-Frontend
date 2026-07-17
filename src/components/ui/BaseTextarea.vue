<script setup lang="ts">
defineProps<{
  label?: string
  placeholder?: string
  rows?: number
  error?: string
  required?: boolean
  maxlength?: number
}>()

const model = defineModel<string>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-foreground">
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </span>
    <textarea
      v-model="model"
      :rows="rows ?? 4"
      :maxlength="maxlength"
      :placeholder="placeholder"
      class="w-full resize-y rounded-base border bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      :class="error ? 'border-danger' : 'border-border'"
    ></textarea>
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </label>
</template>
