<template>
  <div>
    <div class="q-pa-md">
      <q-btn round color="secondary" icon="add" />
    </div>
    <div class="q-pa-md">
      <q-markup-table class="ingredient-table">
        <thead>
          <tr>
            <th class="text-left">Name der Zutat</th>
            <th class="text-right">Alkoholgehalt (%)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody
          v-for="ingredient in available_ingredients"
          :key="ingredient.id"
          clickable
          @click="request_ingredients"
        >
          <tr>
            <td class="text-left">{{ingredient.name}}</td>
            <td class="text-right">{{ingredient.alcohol_percentage}}</td>
            <td><q-btn color="secondary" icon="delete" /></td>
          </tr>
        </tbody>
      </q-markup-table>

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
.ingredient-table
  width: 100%
  max-width: 2500px
</style>
