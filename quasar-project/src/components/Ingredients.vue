<template>
  <div>
    <div class="q-pa-md">
      <q-btn round color="accent" icon="add" />
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
            <td class="text-left">{{ ingredient.name }}</td>
            <td class="text-right">{{ ingredient.alcohol_percentage }}</td>
            <td>
              <q-btn
                @click="delete_ingredient(ingredient.id)"
                color="secondary"
                icon="delete"
              />
            </td>
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
  mounted: function () {
    window.setInterval(() => {
      this.request_ingredients();
    }, 500);
  },
  methods: {
    request_ingredients() {
      // Simple GET request using fetch
      fetch('http://127.0.0.1:5055/api/ingredients')
        .then((response) => response.json())
        .then((data) => (this.available_ingredients = data));
    },
    delete_ingredient(ingred_id) {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ingred_id }),
      };
      fetch('http://127.0.0.1:5055/api/ingredients', requestOptions)
        .then((response) => response.json())
        .then((data) => (this.delResponse = data));
      this.request_ingredients();
    },
  },
};
</script>

<style lang="sass" scoped>
.ingredient-table
  width: 100%
  max-width: 2500px
</style>
