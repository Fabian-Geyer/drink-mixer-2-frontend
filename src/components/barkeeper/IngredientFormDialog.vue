<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import KeyboardInput from '@/components/keyboard/KeyboardInput.vue'
import { ApiError } from '@/lib/api-client'
import { useCreateIngredientMutation, useUpdateIngredientMutation } from '@/queries/useIngredients'
import type { Ingredient } from '@/types/api'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ ingredient?: Ingredient | null }>()

const name = ref('')
const alcoholPercentage = ref([0])

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = props.ingredient?.name ?? ''
    alcoholPercentage.value = [props.ingredient?.alcohol_percentage ?? 0]
  }
})

const isEdit = computed(() => !!props.ingredient)
const createMutation = useCreateIngredientMutation()
const updateMutation = useUpdateIngredientMutation()
const pending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

async function onSubmit() {
  const payload = { name: name.value.trim(), alcohol_percentage: alcoholPercentage.value[0] }
  if (!payload.name) {
    toast.error('Name is required.')
    return
  }
  try {
    if (isEdit.value && props.ingredient) {
      await updateMutation.mutateAsync({ id: props.ingredient.id, payload })
      toast.success(`Updated ${payload.name}.`)
    } else {
      await createMutation.mutateAsync(payload)
      toast.success(`Added ${payload.name}.`)
    }
    open.value = false
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Something went wrong.')
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit ingredient' : 'Add ingredient' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Update this ingredient.' : 'Add a new ingredient to the machine.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-6 py-2">
        <div class="flex flex-col gap-2">
          <Label for="ingredient-name">Name</Label>
          <KeyboardInput id="ingredient-name" v-model="name" placeholder="e.g. Vodka" />
        </div>

        <div class="flex flex-col gap-3">
          <Label>Alcohol: {{ alcoholPercentage[0] }}%</Label>
          <Slider v-model="alcoholPercentage" :min="0" :max="100" :step="1" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button :disabled="pending" @click="onSubmit">{{ isEdit ? 'Save' : 'Add' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
