<template>
  <div class="q-pa-md" style="max-width: 350px">
    <q-list v-for="ingredient in available_ingredients" :key="ingredient.id">
      <q-item @click="request_ingredients">
        <q-item-section>
          <q-item-label>{{ ingredient.name }}</q-item-label>
          <q-item-label caption lines="2">{{
            `${ingredient.alcohol_percentage}%`
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn @click="request_ingredients">request ingredient</q-btn>
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
    axios
      .get('http://127.0.0.1:5055/api/ingredients')
      .then((response) => (this.available_ingredients = response))
      .catch((error) => console.log(error));
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
