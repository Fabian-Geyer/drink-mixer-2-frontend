<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Einstellungen</div>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">3D Viewer Experiment</div>
        <div class="text-body2 text-grey-6 q-mb-md">
          Drag to rotate • Scroll to zoom • Touch supported
        </div>
        <ThreeDViewer />
      </q-card-section>
    </q-card>
    
    <q-card>
      <q-card-section>
        <div class="text-h6">Weitere Einstellungen</div>
        <div class="text-body2 text-grey-6">
          Hier können weitere Einstellungen hinzugefügt werden...
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThreeDViewer from '../components/ThreeDViewer.vue';

export default defineComponent({
  name: 'SettingsPage',
  components: {
    ThreeDViewer,
  },
});
</script>
