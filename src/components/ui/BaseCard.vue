<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="rounded-base border border-border bg-surface p-5 shadow-sm">
    <h3 v-if="title" class="mb-3 text-base font-semibold text-foreground">{{ title }}</h3>
    <slot />
  </div>
</template>
