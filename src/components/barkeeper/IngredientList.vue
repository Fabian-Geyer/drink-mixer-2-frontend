<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ApiError } from '@/lib/api-client'
import { useDeleteIngredientMutation, useIngredientsQuery } from '@/queries/useIngredients'
import IngredientFormDialog from './IngredientFormDialog.vue'
import type { Ingredient } from '@/types/api'

const { data: ingredients, isLoading } = useIngredientsQuery()
const deleteMutation = useDeleteIngredientMutation()

const formOpen = ref(false)
const editingIngredient = ref<Ingredient | null>(null)
const deleteTarget = ref<Ingredient | null>(null)

function openCreate() {
  editingIngredient.value = null
  formOpen.value = true
}

function openEdit(ingredient: Ingredient) {
  editingIngredient.value = ingredient
  formOpen.value = true
}

// Reka UI's AlertDialogAction closes the dialog itself on click - which
// fires our @update:open handler and nulls deleteTarget - before our own
// @click handler below runs, so confirmDelete can't rely on reading
// deleteTarget.value at call time (it's already null by then). This plain
// (non-reactive) variable isn't touched by that auto-close side effect, so
// it survives regardless of handler execution order.
let pendingDeleteIngredient: Ingredient | null = null

function requestDelete(ingredient: Ingredient) {
  pendingDeleteIngredient = ingredient
  deleteTarget.value = ingredient
}

async function confirmDelete() {
  const target = pendingDeleteIngredient
  if (!target) return
  pendingDeleteIngredient = null
  try {
    await deleteMutation.mutateAsync(target.id)
    toast.success(`Deleted ${target.name}.`)
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Something went wrong.')
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Ingredients</h2>
      <Button size="icon" aria-label="Add ingredient" @click="openCreate">
        <Plus />
      </Button>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Alcohol</TableHead>
          <TableHead class="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableEmpty v-if="!isLoading && ingredients?.length === 0" :colspan="3">
          No ingredients yet.
        </TableEmpty>
        <TableRow v-for="ingredient in ingredients" :key="ingredient.id">
          <TableCell class="font-medium">{{ ingredient.name }}</TableCell>
          <TableCell>{{ ingredient.alcohol_percentage }}%</TableCell>
          <TableCell class="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              :aria-label="`Edit ${ingredient.name}`"
              @click="openEdit(ingredient)"
            >
              <Pencil class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              :aria-label="`Delete ${ingredient.name}`"
              @click="requestDelete(ingredient)"
            >
              <Trash2 class="text-destructive size-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <IngredientFormDialog v-model:open="formOpen" :ingredient="editingIngredient" />

    <AlertDialog :open="!!deleteTarget" @update:open="(value) => !value && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {{ deleteTarget?.name }}?</AlertDialogTitle>
          <AlertDialogDescription>
            This also deletes any cocktail that requires this ingredient, and clears it from any
            slot it's loaded in. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
