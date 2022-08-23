<template>
  <q-page class="row items-center justify-evenly">
    <ingredients title="Ingredients"></ingredients>
  </q-page>
</template>

<script lang="ts">
import Ingredients from '../components/Ingredients.vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'BarkeeperPage',
  components: { Ingredients },
  setup() {
    const router = useRouter();
    return { router };
  },
});
</script>
