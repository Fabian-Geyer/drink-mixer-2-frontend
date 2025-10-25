<template>
  <q-page class="row items-center justify-evenly">
    <div class="items-center column justify-evenly">
      <ingredient-add></ingredient-add>
      <ingredient-table title="Ingredients"></ingredient-table>
    </div>
    <div class="items-center column justify-evenly">
      <cocktail-add></cocktail-add>
      <cocktail-table></cocktail-table>
    </div>
  </q-page>
</template>

<script lang="ts">
import IngredientTable from '../components/IngredientTable.vue';
import IngredientAdd from '../components/IngredientAdd.vue';
import CocktailTable from '../components/CocktailTable.vue';
import CocktailAdd from '../components/CocktailAdd.vue';

import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'BarkeeperPage',
  components: {
    IngredientTable,
    IngredientAdd,
    CocktailTable,
    CocktailAdd,
  },
  setup() {
    const router = useRouter();
    return { router };
  },
});
</script>
