<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title align="center">
          Cocktailmaschine V2
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="justify">
        <q-route-tab to="/" label="Zutaten" />
        <q-route-tab to="/" label="Cocktails" />
        <q-route-tab to="/" label="Einstellungen" />
        <q-route-tab to="/" label="Bestellen" />
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
