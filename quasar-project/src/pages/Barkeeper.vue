<template>
  <q-page class="barkeeper-page">
    <div class="page-container">
      <div class="cards-grid">
        <div class="card-column">
          <ingredient-table></ingredient-table>
        </div>
        <div class="card-column">
          <cocktail-table></cocktail-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import IngredientTable from '../components/IngredientTable.vue';
import CocktailTable from '../components/CocktailTable.vue';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BarkeeperPage',
  components: {
    IngredientTable,
    CocktailTable,
  },
});
</script>

<style lang="sass" scoped>
.barkeeper-page
  padding: 0
  background: transparent
  min-height: 100vh

.page-container
  padding: 32px
  max-width: 1400px
  margin: 0 auto

.cards-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 40px
  align-items: start
  
  @media (max-width: 1024px)
    grid-template-columns: 1fr
    gap: 32px
    
  @media (max-width: 768px)
    gap: 24px

.card-column
  display: flex
  flex-direction: column
  gap: 32px
  
  @media (max-width: 768px)
    gap: 24px
</style>
