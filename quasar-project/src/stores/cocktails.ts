import { defineStore } from 'pinia';
import { Settings } from 'src/config';

export const useCocktailStore = defineStore('cocktails', {
  state: () => ({
    cocktails: {},
  }),

  getters: {},

  actions: {
    async update() {
      try {
        // HTTP request
        const response = await fetch(`${Settings.BACKEND_URL}/api/cocktails`);
        
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update the state with the fetched data
        this.cocktails = data;
        
        console.log('Cocktails loaded successfully:', this.cocktails);
      } catch (error) {
        // Handle different types of errors
        console.error('Failed to fetch cocktails:', error);
        
        if (error instanceof TypeError) {
          console.error('Network error - is the backend running?');
        } else if (error instanceof SyntaxError) {
          console.error('Invalid JSON response from server');
        } else {
          console.error('Unknown error occurred');
        }
      }
    },

    async add_cocktail(name: string, ingredients: any[]) {
      try {
        // Prepare the POST request
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: name, 
            ingredients: ingredients
          }),
        };
        
        // Make the POST request
        const response = await fetch(`${Settings.BACKEND_URL}/api/cocktails`, requestOptions);
        
        // Check if the addition was successful
        if (!response.ok) {
          throw new Error(`Failed to add cocktail! status: ${response.status}`);
        }
        
        // Update store after successful addition
        await this.update();
        
        console.log('Cocktail added successfully');
      } catch (error) {
        console.error('Failed to add cocktail:', error);
        
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
