<template>
  <div>
    <q-btn round color="accent" icon="add" @click="showDialog = true" />

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

export default {
  name: 'IngredientAdd',
  setup() {
    return {
      showDialog: ref(false),
      alcohol_percentage: ref(0),

      ingredient_name: ref(''),
    };
  },
  methods: {
    add_ingredient() {
      //const element = document.querySelector(
      //  '#post-request-set-headers .article-id'
      //);
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.ingredient_name,
          alcohol_percentage: this.alcohol_percentage,
        }),
      };
      fetch(`${Settings.BACKEND_URL}/api/ingredients`, requestOptions).then(
        (response) => response.json()
      );
    },
  },
};
// TODO: Use state management and state methods for ingredients (https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-reactivity-api)
</script>
