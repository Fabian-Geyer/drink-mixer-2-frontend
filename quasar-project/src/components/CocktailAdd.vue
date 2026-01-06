<template>
  <div>
    <q-btn color="primary" @click="showDialog = true">
      <q-icon left size="3em" name="add" />
      <div>Neuer Cocktail</div>
    </q-btn>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cocktail hinzufügen:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            clearable
            dense
            placeholder="Name"
            v-model="cocktailName"
            autofocus
            @keyup.enter="prompt = false"
          />
        </q-card-section>
        <q-card-section>
          <div class="text-h6">Zutaten:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-card v-for="(ingredient, index) in newIngredients" :key="index">
            <q-card-section class="q-pt-none">
              <div class="row q-gutter-md items-center">
                <div class="col">
                  <q-select
                    v-model="ingredient.selectedIngredient"
                    :options="ingredientOptions"
                    option-label="name"
                    option-value="id"
                    placeholder="Zutat auswählen..."
                    clearable
                    use-input
                    @filter="filterIngredients"
                    @update:model-value="(value) => updateSelectedIngredient(index, value)"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          Keine Zutaten gefunden
                        </q-item-section>
                      </q-item>
                    </template>
                    
                    <template v-slot:after-options>
                      <q-separator />
                      <q-item clickable @click="openAddIngredientDialog">
                        <q-item-section avatar>
                          <q-icon name="add" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Neue Zutat hinzufügen</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div v-if="newIngredients.length > 1">
                  <q-btn 
                    flat 
                    round 
                    color="negative" 
                    icon="remove" 
                    @click="removeIngredient(index)"
                    size="sm"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <q-card-section class="text-center">
            <q-btn 
              flat 
              color="primary" 
              icon="add" 
              label="Weitere Zutat hinzufügen"
              @click="addIngredientSlot"
            />
          </q-card-section>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn
            flat
            label="Cocktail hinzufügen"
            v-close-popup
            @click="add_cocktail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Ingredient Add Dialog -->
    <q-dialog v-model="showAddIngredientDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Neue Zutat hinzufügen:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            clearable
            dense
            placeholder="Name der Zutat"
            v-model="newIngredientName"
            autofocus
          />
        </q-card-section>
        
        <q-card-section>
          <div class="text-h6">Alkoholgehalt:</div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <q-slider
            v-model="newIngredientAlcohol"
            :min="0"
            :max="100"
            :step="1"
            label
            :label-value="newIngredientAlcohol + '%'"
            label-always
            switch-label-side
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Abbrechen" @click="closeAddIngredientDialog" />
          <q-btn
            flat
            label="Zutat hinzufügen"
            @click="addNewIngredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useIngredientStore } from 'src/stores/ingredients';
import { useCocktailStore } from 'src/stores/cocktails';

export default {
  name: 'CocktailAdd',
  setup() {
    const ingredientStore = useIngredientStore();
    const cocktailStore = useCocktailStore();
    
    // Load ingredients when component mounts
    onMounted(() => {
      ingredientStore.update();
    });

    return {
      showDialog: ref(false),
      showAddIngredientDialog: ref(false),
      ingredientStore,
      cocktailStore,
      cocktailName: ref(''),
      newIngredients: ref([{ selectedIngredient: null }]),
      ingredientOptions: ref([]),
      newIngredientName: ref(''),
      newIngredientAlcohol: ref(0),
    };
  },
  computed: {
    availableIngredients() {
      // Convert ingredients object to array for the dropdown
      if (this.ingredientStore.ingredients && typeof this.ingredientStore.ingredients === 'object') {
        return Object.values(this.ingredientStore.ingredients);
      }
      return [];
    }
  },
  methods: {
    filterIngredients(val, update) {
      update(() => {
        if (val === '') {
          this.ingredientOptions = this.availableIngredients;
        } else {
          const needle = val.toLowerCase();
          this.ingredientOptions = this.availableIngredients.filter(
            ingredient => ingredient.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },

    updateSelectedIngredient(index, value) {
      this.newIngredients[index].selectedIngredient = value;
    },

    addIngredientSlot() {
      this.newIngredients.push({ selectedIngredient: null });
    },

    removeIngredient(index) {
      if (this.newIngredients.length > 1) {
        this.newIngredients.splice(index, 1);
      }
    },

    openAddIngredientDialog() {
      this.showAddIngredientDialog = true;
    },

    closeAddIngredientDialog() {
      this.showAddIngredientDialog = false;
      this.newIngredientName = '';
      this.newIngredientAlcohol = 0;
    },

    async addNewIngredient() {
      try {
        await this.ingredientStore.add_ingredient(this.newIngredientName, this.newIngredientAlcohol);
        this.closeAddIngredientDialog();
        // Refresh the ingredient options
        this.ingredientOptions = this.availableIngredients;
      } catch (error) {
        console.error('Failed to add new ingredient:', error);
        // TODO: Add user-friendly error message
      }
    },

    async add_cocktail() {
      try {
        // Filter out empty ingredients and map to the format expected by the store
        const selectedIngredients = this.newIngredients
          .filter(ingredient => ingredient.selectedIngredient)
          .map(ingredient => ({
            name: ingredient.selectedIngredient.name,
            id: ingredient.selectedIngredient.id
          }));
        
        if (selectedIngredients.length === 0) {
          console.warn('No ingredients selected');
          return;
        }

        // Call store action instead of direct API call
        await this.cocktailStore.add_cocktail(this.cocktailName, selectedIngredients);
        
        // Reset form after successful addition
        this.cocktailName = '';
        this.newIngredients = [{ selectedIngredient: null }];
        
      } catch (error) {
        // Handle UI feedback for errors
        console.error('Failed to add cocktail in UI:', error);
        // TODO: Add user-friendly error message here
      }
    },
  },

  mounted() {
    // Initialize ingredient options when component is mounted
    this.ingredientOptions = this.availableIngredients;
  },

  watch: {
    // Update ingredient options when ingredients in store change
    'ingredientStore.ingredients': {
      handler() {
        this.ingredientOptions = this.availableIngredients;
      },
      deep: true
    }
  },
};
</script>
