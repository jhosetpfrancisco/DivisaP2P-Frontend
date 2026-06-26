<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  { variant: 'neutral' },
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-surface-muted text-foreground-soft': variant === 'neutral',
      'bg-brand-100 text-brand-700': variant === 'success',
      'bg-amber-100 text-amber-700': variant === 'warning',
      'bg-red-100 text-red-700': variant === 'danger',
      'bg-blue-100 text-blue-700': variant === 'info',
    }"
  >
    <slot />
  </span>
</template>
