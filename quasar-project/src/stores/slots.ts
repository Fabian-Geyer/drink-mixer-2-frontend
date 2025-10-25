import { defineStore } from 'pinia';
import { Settings } from 'src/config';
import { useIngredientStore  } from './ingredients';

export const useSlotStore = defineStore('slots', {
    state: () => ({
        slots: {},
    }),