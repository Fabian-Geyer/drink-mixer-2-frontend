import { defineStore } from 'pinia';
import { Settings } from 'src/config';

export const UseCocktails = defineStore('cocktails', {
  state: () => ({
    cocktails: {},
  }),

  getters: {},

  actions: {
    update() {
      fetch(`${Settings.BACKEND_URL}/api/cocktails`)
        .then((response) => response.json())
        .then((data) => (this.cocktails = data));
        console.log(this.cocktails)
    },
  },
});
