<template>
  <div class="card text-center m-3">
    <h5 class="card-header">{{ available_cocktails }}</h5>
    <li v-for="cocktail in available_cocktails" :key="cocktail.id">
  {{ cocktail.name }}
</li>
    <q-btn @click="request_cocktails">request cocktail</q-btn>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'get-request',
  data() {
    return {
      available_cocktails: null
    };
  },
  mounted() {
    axios
      .get('http://127.0.0.1:5055/api/cocktails/available')
      .then((response) => (this.available_cocktails = response))
      .catch((error) => console.log(error));
  },
  methods: {
    request_cocktails() {
      // Simple GET request using fetch
      console.log('before request');
      fetch('http://127.0.0.1:5055/api/cocktails')
        .then((response) => response.json())
        .then((data) => (this.available_cocktails = data));
      console.log(`test: ${this.available_cocktails}`);
    },
  }
};
</script>
