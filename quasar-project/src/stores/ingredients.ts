import { defineStore } from 'pinia';
import { Settings } from 'src/config';

export const UseIngredients = defineStore('ingredients', {
  state: () => ({
    ingredients: {},
    ingredToDelete: null,
  }),

  getters: {},

  actions: {
    update() {
      fetch(`${Settings.BACKEND_URL}/api/ingredients`)
        .then((response) => response.json())
        .then((data) => (this.ingredients = data));
      console.log(this.ingredients);
    },
    async delete_ingredient() {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.ingredToDelete }),
      };
      await fetch(`${Settings.BACKEND_URL}/api/ingredients`, requestOptions);
      this.update();
    },
  },
});
