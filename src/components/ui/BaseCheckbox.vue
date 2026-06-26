<script setup lang="ts">
defineProps<{
  label?: string
}>()

const model = defineModel<boolean>()
</script>

<template>
  <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
    <input
      v-model="model"
      type="checkbox"
      class="h-4 w-4 rounded border-border text-brand-600 focus:ring-2 focus:ring-brand-100"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
