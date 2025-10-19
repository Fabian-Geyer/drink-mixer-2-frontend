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
          <q-card v-for="ingredient in newIngredients" :key="ingredient.id">
            <q-card-section class="q-pt-none">
              <q-input
                clearable
                dense
                placeholder="Name"
                v-model="ingredient.name"
                autofocus
                @keyup.enter="prompt = false"
              />
            </q-card-section>
          </q-card>
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
  </div>
</template>

<script>
import { ref } from 'vue';
import { Settings } from 'src/config.ts';
import { UseIngredients } from 'src/stores/ingredients';
import { UseCocktails } from 'src/stores/cocktails';

export default {
  name: 'CocktailAdd',
  setup() {
    let newIngredients = [
      {
        name: 'Name',
        id: null,
      },
    ];
    const ingredStore = UseIngredients();
    const cocktailStore = UseCocktails();
    return {
      showDialog: ref(false),
      ingredStore,
      ingredients: ref({}),
      cocktailStore,
      newIngredients,
    };
  },
  methods: {
    async add_cocktail() {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.cocktail_name,
          // ingredients here,
        }),
      };
      await fetch(
        `${Settings.BACKEND_URL}/api/ingredients`,
        requestOptions,
      ).then((response) => response.json());
      this.ingredStore.update();
    },
  },
};
</script>
