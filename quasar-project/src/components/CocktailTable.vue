<template>
  <div class="q-pa-md">
    <q-list bordered padding style="width: 300px">
      <q-item-label header>Cocktailrezepte</q-item-label>

      <q-item
        v-for="cocktail in cocktailStore.cocktails"
        :key="cocktail.id"
        clickable
        v-ripple
      >
        <q-item-section>
          <q-item-label>{{ cocktail.name }}</q-item-label>
          <q-item-label
            v-for="ingredient in cocktail.ingredients"
            :key="ingredient.id"
            caption
          >
          {{ingredient}}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { UseCocktails } from 'stores/cocktails';
export default {
  name: 'CocktailTable',
  setup() {
    const cocktailStore = UseCocktails();
    return {
      cocktailStore,
    };
  },
  mounted() {
    this.cocktailStore.update();
  },
};
</script>

<style></style>
