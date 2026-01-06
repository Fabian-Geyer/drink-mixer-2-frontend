<template>
  <div>
    <q-btn class="q-btn--add" color="primary" @click="showDialog = true">
      <q-icon left size="3em" name="add" />
    </q-btn>
    <q-dialog v-model="showDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Name des Cocktails:</div>
          </q-card-section>
        </q-card>
    </q-dialog>
  </div>
</template>


<script>
import { ref } from 'vue';
import { useCocktailStore } from 'src/stores/cocktails';

export default {
  name: 'CocktailAdd',
  setup() {
    const cocktailStore = useCocktailStore();
    return {
      cocktailStore,
      showDialog: ref(false),
    }
  },
};
</script>