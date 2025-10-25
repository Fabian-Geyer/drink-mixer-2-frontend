<template>
  <q-layout view="hHh lpR fFf" class="modern-theme">
    <q-header class="modern-header" height-hint="98">
      <q-toolbar class="toolbar-gradient">
        <q-toolbar-title class="toolbar-title">
          <div class="app-title">Cocktailmaschine V2</div>
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs class="modern-tabs" align="justify" indicator-color="white" active-color="white">
        <q-route-tab to="/barkeeper" label="Barkeeper" icon="person" class="modern-tab" />
        <q-route-tab to="/settings" label="Einstellungen" icon="settings" class="modern-tab" />
        <q-route-tab to="/order" label="Bestellen" icon="local_bar" class="modern-tab" />
      </q-tabs>
    </q-header>
    <q-page-container class="modern-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',
});
</script>

<style lang="sass" scoped>
.modern-header
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.8)
  border-bottom: 1px solid var(--modern-border)

.toolbar-gradient
  background: linear-gradient(135deg, var(--modern-black) 0%, var(--modern-dark) 100%)
  backdrop-filter: blur(20px)

.app-title
  font-weight: 700
  font-size: 1.5rem
  letter-spacing: 2px
  color: var(--modern-text-primary)
  text-shadow: 0 0 20px rgba(30, 144, 255, 0.3)

.modern-tabs
  background: rgba(30, 144, 255, 0.05)
  backdrop-filter: blur(20px)
  border-top: 1px solid var(--modern-border)

.modern-tab
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  color: var(--modern-text-secondary)
  
  &:hover
    background: rgba(30, 144, 255, 0.1)
    color: var(--modern-primary)
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(30, 144, 255, 0.2)
    
  &.q-tab--active
    color: var(--modern-primary)
    background: rgba(30, 144, 255, 0.1)

.modern-page-container
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)
  min-height: calc(100vh - 98px)
</style>
