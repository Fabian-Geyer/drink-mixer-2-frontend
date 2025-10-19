<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title align="center"> Cocktailmaschine V2 </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="justify">
        <q-route-tab to="/barkeeper" label="Barkeeper" icon="person" />
        <q-route-tab to="/settings" label="Einstellungen" icon="settings" />
        <q-route-tab to="/order" label="Bestellen" icon="local_bar" />
      </q-tabs>
    </q-header>
    <q-page-container>
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
