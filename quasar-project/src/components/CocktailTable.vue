<template>
  <div class="q-pa-md">
    <q-card class="cocktail-card">
      <!-- Card Header -->
      <q-card-section class="card-header">
        <div class="text-h6 text-white">Cocktailrezepte</div>
      </q-card-section>
      
      <!-- Cocktail List Content -->
      <q-card-section class="q-pa-none">
        <q-list class="cocktail-list">
          <q-item
            v-for="cocktail in cocktailStore.cocktails"
            :key="cocktail.id"
            clickable
            v-ripple
            class="cocktail-item"
          >
            <q-item-section>
              <q-item-label class="cocktail-name">{{ cocktail.name }}</q-item-label>
              <q-item-label
                v-for="ingredient in cocktail.ingredients"
                :key="ingredient.id"
                caption
                class="ingredient-caption"
              >
                {{ ingredient.name + ': ' + ingredient.amount_percentage + '%' }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      
      <!-- Add Button Section -->
      <q-card-section class="q-pt-md">
        <div class="row justify-end">
          <q-btn 
            color="primary" 
            @click="showAddDialog = true" 
            icon="add" 
            label=""
            unelevated
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { UseCocktails } from 'stores/cocktails';
export default {
  name: 'CocktailTable',
  setup() {
    const cocktailStore = UseCocktails();
    return {
      cocktailStore,
      showAddDialog: ref(false),
    };
  },
  mounted() {
    this.cocktailStore.update();
  },
};
</script>

<style lang="sass" scoped>
.cocktail-card
  width: 100%
  max-width: 600px
  border-radius: 16px
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
  background: var(--modern-surface)
  border: 1px solid var(--modern-border)

.card-header
  background: linear-gradient(135deg, var(--ingredient-gradient-start) 0%, var(--ingredient-gradient-end) 100%)
  border-radius: 16px 16px 0 0
  border-bottom: 1px solid var(--modern-border)
  
  .text-h6
    font-weight: 700
    letter-spacing: 1px
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.1)

.cocktail-list
  background: transparent
  
  .cocktail-item
    border-bottom: 1px solid var(--modern-border)
    padding: 20px
    background: transparent
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    
    &:last-child
      border-bottom: none
      
    &:hover
      background: rgba(30, 144, 255, 0.05)
      transform: translateX(4px)
      
  .cocktail-name
    font-weight: 700
    color: var(--modern-text-primary)
    margin-bottom: 8px
    letter-spacing: 0.5px
    
  .ingredient-caption
    color: var(--modern-text-secondary)
    font-size: 0.9em
    font-weight: 500
</style>
