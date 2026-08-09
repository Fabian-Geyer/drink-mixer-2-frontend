<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Minus, Plus, X } from '@lucide/vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import KeyboardInput from '@/components/keyboard/KeyboardInput.vue'
import { ApiError } from '@/lib/api-client'
import { useIngredientsQuery } from '@/queries/useIngredients'
import { useCreateCocktailMutation, useUpdateCocktailMutation } from '@/queries/useCocktails'
import type { Cocktail } from '@/types/api'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ cocktail?: Cocktail | null }>()

interface Row {
  ingredientId: string
  amount: number
}

const name = ref('')
const rows = ref<Row[]>([])

function blankRow(): Row {
  return { ingredientId: '', amount: 1 }
}

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = props.cocktail?.name ?? ''
    rows.value = props.cocktail?.ingredients.length
      ? props.cocktail.ingredients.map((i) => ({ ingredientId: String(i.id), amount: i.amount }))
      : [blankRow()]
  }
})

const { data: ingredients } = useIngredientsQuery()

function addRow() {
  rows.value.push(blankRow())
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

function adjustAmount(index: number, delta: number) {
  const row = rows.value[index]
  if (!row) return
  row.amount = Math.max(1, row.amount + delta)
}

const isEdit = computed(() => !!props.cocktail)
const createMutation = useCreateCocktailMutation()
const updateMutation = useUpdateCocktailMutation()
const pending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

async function onSubmit() {
  const trimmedName = name.value.trim()
  const validRows = rows.value.filter((row) => row.ingredientId)
  if (!trimmedName) {
    toast.error('Name is required.')
    return
  }
  if (validRows.length === 0) {
    toast.error('Add at least one ingredient.')
    return
  }

  const payload = {
    name: trimmedName,
    ingredients: validRows.map((row) => ({
      ingredient_id: Number(row.ingredientId),
      amount: row.amount,
    })),
  }

  try {
    if (isEdit.value && props.cocktail) {
      await updateMutation.mutateAsync({ id: props.cocktail.id, payload })
      toast.success(`Updated ${trimmedName}.`)
    } else {
      await createMutation.mutateAsync(payload)
      toast.success(`Added ${trimmedName}.`)
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
        <DialogTitle>{{ isEdit ? 'Edit cocktail' : 'Add cocktail' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Update this recipe.' : 'Define a new recipe.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-2">
          <Label for="cocktail-name">Name</Label>
          <KeyboardInput id="cocktail-name" v-model="name" placeholder="e.g. Screwdriver" />
        </div>

        <div class="flex flex-col gap-2">
          <Label>Ingredients</Label>
          <div v-for="(row, index) in rows" :key="index" class="flex items-center gap-2">
            <Select v-model="row.ingredientId">
              <SelectTrigger class="flex-1">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="ingredient in ingredients"
                  :key="ingredient.id"
                  :value="String(ingredient.id)"
                >
                  {{ ingredient.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div class="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Decrease amount"
                @click="adjustAmount(index, -1)"
              >
                <Minus class="size-4" />
              </Button>
              <span class="w-6 text-center tabular-nums">{{ row.amount }}</span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Increase amount"
                @click="adjustAmount(index, 1)"
              >
                <Plus class="size-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove ingredient row"
              @click="removeRow(index)"
            >
              <X class="text-destructive size-4" />
            </Button>
          </div>

          <Button type="button" variant="outline" size="sm" class="self-start" @click="addRow">
            Add ingredient row
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button :disabled="pending" @click="onSubmit">{{ isEdit ? 'Save' : 'Add' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
