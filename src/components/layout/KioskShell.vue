<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './NavBar.vue'
</script>

<template>
  <div class="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
    <main class="min-h-0 flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <NavBar />
  </div>
</template>
