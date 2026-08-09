<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './NavBar.vue'
import OnScreenKeyboard from '@/components/keyboard/OnScreenKeyboard.vue'
import PinGateDialog from '@/components/pin/PinGateDialog.vue'
</script>

<template>
  <div class="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
    <main class="min-h-0 flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <OnScreenKeyboard />
    <NavBar />
    <PinGateDialog />
  </div>
</template>
