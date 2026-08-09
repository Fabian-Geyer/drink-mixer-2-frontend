<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Martini, Users, Settings, Activity } from '@lucide/vue'

const route = useRoute()

const links = [
  { to: '/order', label: 'Order', icon: Martini },
  { to: '/barkeeper', label: 'Barkeeper', icon: Users },
  { to: '/status', label: 'Status', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]
</script>

<template>
  <nav
    class="bg-card border-border flex h-16 shrink-0 items-stretch border-t"
    aria-label="Main navigation"
  >
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="text-muted-foreground hover:text-foreground flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors"
      :class="{
        'text-primary bg-primary/10': route.path.startsWith(link.to),
      }"
    >
      <component :is="link.icon" class="size-5" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>
