<template>
  <div class="q-pa-md">
    <q-card class="ingredient-card">
      <!-- Card Header -->
      <q-card-section class="card-header">
        <div class="text-h6 text-white">Zutaten</div>
      </q-card-section>
      
      <!-- Table Content -->
      <q-card-section class="q-pa-none">
        <q-markup-table class="ingredient-table" flat>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-right">Alkoholgehalt (%)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody
            v-for="ingredient in ingredientStore.ingredients"
            :key="ingredient.id"
          >
            <tr class="clickable-row" @click="openEditDialog(ingredient)">
              <td class="text-left">{{ ingredient.name }}</td>
              <td class="text-right">{{ ingredient.alcohol_percentage }}</td>
              <td class="text-right">
                <q-btn
                  @click.stop="
                    confirm = true;
                    ingredientStore.ingredToDelete = ingredient.id;
                  "
                  color="secondary"
                  icon="delete"
                  size="sm"
                  round
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      
      <!-- Add Button Section -->
      <q-card-section class="q-pt-md">
        <div class="row justify-end">
          <q-btn 
            color="primary" 
            @click="showAddDialog = true" 
            icon="add" 
            label=""
            unelevated
          />
        </div>
      </q-card-section>
    </q-card>
    <!-- Add Ingredient Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Name der Zutat:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            clearable
            dense
            placeholder="Zutat"
            v-model="ingredient_name"
            autofocus
            @keyup.enter="add_ingredient"
          />
        </q-card-section>
        <q-card-section>
          <div class="text-h6">Alkoholgehalt:</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-slider
            v-model="alcohol_percentage"
            :min="0"
            :max="100"
            :step="1"
            label
            :label-value="alcohol_percentage + '%'"
            label-always
            switch-label-side
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Abbrechen" v-close-popup @click="resetAddForm" />
          <q-btn
            flat
            label="Zutat hinzufügen"
            v-close-popup
            @click="add_ingredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Ingredient Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Zutat bearbeiten:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            clearable
            dense
            placeholder="Zutat"
            v-model="editIngredientName"
            autofocus
            @keyup.enter="edit_ingredient"
          />
        </q-card-section>
        <q-card-section>
          <div class="text-h6">Alkoholgehalt:</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-slider
            v-model="editAlcoholPercentage"
            :min="0"
            :max="100"
            :step="1"
            label
            :label-value="editAlcoholPercentage + '%'"
            label-always
            switch-label-side
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Abbrechen" v-close-popup @click="resetEditForm" />
          <q-btn
            flat
            label="Zutat speichern"
            v-close-popup
            @click="edit_ingredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm"
            >Willst du die Zutat und alle zugehörigen Cocktails löschen?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Löschen"
            color="negative"
            v-close-popup
            @click="ingredientStore.delete_ingredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useIngredientStore } from 'stores/ingredients';

export default {
  name: 'IngredientTable',
  setup() {
    const ingredientStore = useIngredientStore();
    return {
      ingredientStore,
      confirm: ref(false),
      showAddDialog: ref(false),
      showEditDialog: ref(false),
      alcohol_percentage: ref(0),
      ingredient_name: ref(''),
      editingIngredient: ref(null),
      editAlcoholPercentage: ref(0),
      editIngredientName: ref(''),
    };
  },
  data() {
    return {
      delete_id: null,
    };
  },
  mounted: function () {
    this.ingredientStore.update();
  },
  methods: {
    async add_ingredient() {
      try {
        // Call store action instead of direct API call
        await this.ingredientStore.add_ingredient(this.ingredient_name, this.alcohol_percentage);
        this.resetAddForm();
      } catch (error) {
        // Handle UI feedback for errors (could show toast/notification)
        console.error('Failed to add ingredient in UI:', error);
        // TODO: Add user-friendly error message here
      }
    },
    resetAddForm() {
      this.ingredient_name = '';
      this.alcohol_percentage = 0;
      this.showAddDialog = false;
    },
    openEditDialog(ingredient) {
      this.editingIngredient = ingredient;
      this.editIngredientName = ingredient.name;
      this.editAlcoholPercentage = ingredient.alcohol_percentage;
      this.showEditDialog = true;
    },
    async edit_ingredient() {
      try {
        // Call store action to edit ingredient
        await this.ingredientStore.edit_ingredient(
          this.editingIngredient.id, 
          this.editIngredientName, 
          this.editAlcoholPercentage
        );
        this.resetEditForm();
      } catch (error) {
        // Handle UI feedback for errors (could show toast/notification)
        console.error('Failed to edit ingredient in UI:', error);
        // TODO: Add user-friendly error message here
      }
    },
    resetEditForm() {
      this.editingIngredient = null;
      this.editIngredientName = '';
      this.editAlcoholPercentage = 0;
      this.showEditDialog = false;
    },
  },
};
</script>

<style lang="sass" scoped>
.ingredient-card
  width: 100%
  max-width: 600px
  border-radius: 16px
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
  background: var(--modern-surface)
  border: 1px solid var(--modern-border)

.card-header
  background: linear-gradient(135deg, var(--ingredient-gradient-start) 0%, var(--ingredient-gradient-end) 100%)
  border-radius: 16px 16px 0 0
  border-bottom: 1px solid var(--modern-border)
  
  .text-h6
    font-weight: 700
    letter-spacing: 1px
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.1)

.ingredient-table
  width: 100%
  background: transparent
  
  thead th
    background: var(--modern-darker)
    color: var(--modern-text-primary)
    font-weight: 700
    border-bottom: 2px solid var(--modern-border)
    letter-spacing: 0.5px
    
  tbody tr
    &:hover
      background: rgba(30, 144, 255, 0.05)
      
  tbody td
    color: var(--modern-text-primary)
    border-bottom: 1px solid var(--modern-border)
    font-weight: 500

.clickable-row
  cursor: pointer
  transition: background-color 0.2s ease
  
  &:hover
    background: rgba(30, 144, 255, 0.1) !important
</style>
