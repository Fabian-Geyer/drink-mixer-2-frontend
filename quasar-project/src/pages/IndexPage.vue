<template>
  <q-page class="row items-center justify-evenly">
    <ingredients
      title="Ingredients"
    ></ingredients>
  </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models';
import Ingredients from 'components/Ingredients.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  components: { Ingredients },
  });
</script>
