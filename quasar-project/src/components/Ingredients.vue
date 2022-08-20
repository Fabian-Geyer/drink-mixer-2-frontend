<template>
  <div>
    <div class="q-pa-md">
      <q-btn round color="secondary" icon="add" />
    </div>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card
        v-for="ingredient in available_ingredients"
        :key="ingredient.id"
        dark
        bordered
        clickable
        class="ingredient-card bg-primary text-white cursor-pointer q-hoverable"
      >
        <span class="q-focus-helper"></span>
        <q-card-section>
          <div class="text-h6">{{ ingredient.name }}</div>
          <div class="text-subtitle2">
            {{ `Alkohol: ${ingredient.alcohol_percentage}%` }}
          </div>
        </q-card-section>
      </q-card>
      <q-btn @click="request_ingredients">GET request</q-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'get-request',
  data() {
    return {
      available_ingredients: null,
    };
  },
  mounted() {
    this.request_ingredients();
  },
  methods: {
    request_ingredients() {
      // Simple GET request using fetch
      console.log('before request');
      fetch('http://127.0.0.1:5055/api/ingredients')
        .then((response) => response.json())
        .then((data) => (this.available_ingredients = data));
      console.log(`test: ${this.available_ingredients}`);
    },
  },
};
</script>

<style lang="sass" scoped>
.ingredient-card
  width: 100%
  max-width: 250px
</style>
