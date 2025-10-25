import { defineStore } from 'pinia';
import { Settings } from 'src/config';
import { useCocktailStore } from './cocktails';

export const useIngredientStore = defineStore('ingredients', {
  state: () => ({
    ingredients: {},
    ingredToDelete: null,
  }),

  getters: {},

  actions: {
    async update() {
      try {
        // HTTP request
        const response = await fetch(`${Settings.BACKEND_URL}/api/ingredients`);
        
        // Check if the response status
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update the state with the fetched data
        this.ingredients = data;
        
        console.log('Ingredients loaded successfully:', this.ingredients);
      } catch (error) {
        // Handle different types of errors
        console.error('Failed to fetch ingredients:', error);
        
        if (error instanceof TypeError) {
          console.error('Network error - is the backend running?');
        } else if (error instanceof SyntaxError) {
          console.error('Invalid JSON response from server');
        } else {
          console.error('Unknown error occurred');
        }
      }
    },
    async delete_ingredient() {
      try {
        const cocktailStore = useCocktailStore();
        
        // Prepare the DELETE request
        const requestOptions = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: this.ingredToDelete }),
        };
        
        // Make the DELETE request
        const response = await fetch(`${Settings.BACKEND_URL}/api/ingredients`, requestOptions);
        
        // Check if the deletion was successful
        if (!response.ok) {
          throw new Error(`Failed to delete ingredient! status: ${response.status}`);
        }
        
        // Update both stores after successful deletion
        await this.update();
        await cocktailStore.update();
        
        console.log('Ingredient deleted successfully');
      } catch (error) {
        console.error('Failed to delete ingredient:', error);
        
        // Handle specific error types
        if (error instanceof TypeError) {
          console.error('Network error - could not connect to backend');
        } else {
          console.error('Server error during deletion');
        }
        
        // Re-throw the error so the UI can handle it if needed
        throw error;
      }
    },

    async add_ingredient(name: string, alcohol_percentage: number) {
      try {
        // Prepare the POST request
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name, 
            alcohol_percentage: alcohol_percentage 
          }),
        };
        
        // Make the POST request
        const response = await fetch(`${Settings.BACKEND_URL}/api/ingredients`, requestOptions);
        
        // Check if the addition was successful
        if (!response.ok) {
          throw new Error(`Failed to add ingredient! status: ${response.status}`);
        }
        
        // Update store after successful addition
        await this.update();
        
        console.log('Ingredient added successfully');
      } catch (error) {
        console.error('Failed to add ingredient:', error);
        
        // Handle specific error types
        if (error instanceof TypeError) {
          console.error('Network error - could not connect to backend');
        } else {
          console.error('Server error during addition');
        }
        
        // Re-throw the error so the UI can handle it if needed
        throw error;
      }
    },
  },
});
