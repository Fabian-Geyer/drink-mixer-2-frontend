import { defineStore } from 'pinia';
import { Settings } from 'src/config';

export const UseIngredients = defineStore('ingredients', {
  state: () => ({
    ingredients: {},
  }),

  getters: {
    //doubleCount (state) {
    //  return state.counter * 2;
    //}
  },

  actions: {
    update() {
      fetch(`${Settings.BACKEND_URL}/api/ingredients`)
        .then((response) => response.json())
        .then((data) => (this.ingredients = data));
        console.log(this.ingredients)
    },
  },
});
