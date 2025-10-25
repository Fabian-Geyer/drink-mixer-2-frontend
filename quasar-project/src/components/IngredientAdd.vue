<template>
  <div>
    <q-btn color="primary" @click="showDialog = true">
      <q-icon left size="3em" name="add" />
      <div>Neue Zutat</div>
    </q-btn>

    <q-dialog v-model="showDialog" persistent>
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
            @keyup.enter="prompt = false"
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
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn
            flat
            label="Zutat hinzufügen"
            v-close-popup
            @click="add_ingredient"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Settings } from 'src/config.ts';
import { useIngredientStore } from 'src/stores/ingredients';

export default {
  name: 'IngredientAdd',
  setup() {
    const ingredStore = useIngredientStore();
    return {
      showDialog: ref(false),
      alcohol_percentage: ref(0),
      ingredient_name: ref(''),
      ingredStore,
    };
  },
  methods: {
    async add_ingredient() {
      await this.ingredStore.add_ingredient(this.ingredient_name, this.alcohol_percentage);
    },
  },
};
</script>
