<template>
  <div>
    <div class="row items-center justify-evenly">
      <q-btn round color="accent" icon="add" />
    </div>

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
          v-for="ingredient in available_ingredients"
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
                  ingred_to_delete = ingredient.id;
                "
                color="secondary"
                icon="delete"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
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
            @click="delete_ingredient"
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
  name: 'get-request',
  setup() {
    return {
      confirm: ref(false),
      ingred_to_delete: ref(null),
    };
  },
  data() {
    return {
      available_ingredients: null,
      delete_id: null,
    };
  },
  mounted: function () {
    window.setInterval(() => {
      this.request_ingredients();
    }, Settings.REQUEST_TIMEOUT);
  },
  methods: {
    request_ingredients() {
      // Simple GET request using fetch
      console.log(Settings.BACKEND_URL);
      fetch(`${Settings.BACKEND_URL}/api/ingredients`)
        .then((response) => response.json())
        .then((data) => (this.available_ingredients = data));
    },
    delete_ingredient() {
      const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.ingred_to_delete }),
      };
      fetch(`${Settings.BACKEND_URL}/api/ingredients`, requestOptions)
        .then((response) => response.json())
        .then((data) => (this.delResponse = data));
      this.request_ingredients();
    },
  },
};
</script>

<style lang="sass" scoped>
.ingredient-table
  width: 100%
  max-width: 560px
</style>
