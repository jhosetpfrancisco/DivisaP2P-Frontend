<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false, block: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-base px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      block && 'w-full',
      variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700',
      variant === 'secondary' && 'border border-border bg-surface text-foreground hover:bg-surface-muted',
      variant === 'ghost' && 'text-foreground hover:bg-surface-muted',
      variant === 'danger' && 'bg-danger text-white hover:opacity-90',
    ]"
  >
    <slot />
  </button>
</template>
