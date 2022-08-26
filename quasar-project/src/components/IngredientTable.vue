<template>
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
        v-for="ingredient in ingredStore.ingredients"
        :key="ingredient.id"
        clickable
        @click="request_ingredients"
      >
        <tr>
          <td class="text-left">{{ ingredient.name }}</td>
          <td class="text-right">{{ ingredient.alcohol_percentage }}</td>
          <td class="text-right">
            <q-btn
              @click="
                confirm = true;
                ingredStore.ingredToDelete = ingredient.id;
              "
              color="secondary"
              icon="delete"
            />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
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
            @click="ingredStore.delete_ingredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Settings } from 'src/config.ts';
import { UseIngredients } from 'stores/ingredients';

export default {
  name: 'IngredientTable',
  setup() {
    const ingredStore = UseIngredients();
    return {
      ingredStore,
      confirm: ref(false),
    };
  },
  data() {
    return {
      delete_id: null,
    };
  },
  mounted: function () {
    this.ingredStore.update();
  },
  methods: {},
};
</script>

<style lang="sass" scoped>
.ingredient-table
  width: 100%
  max-width: 560px
</style>
