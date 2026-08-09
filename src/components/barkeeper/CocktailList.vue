<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useCocktailsQuery, useDeleteCocktailMutation } from '@/queries/useCocktails'
import CocktailFormDialog from './CocktailFormDialog.vue'
import type { Cocktail } from '@/types/api'

const { data: cocktails, isLoading } = useCocktailsQuery()
const deleteMutation = useDeleteCocktailMutation()

const formOpen = ref(false)
const editingCocktail = ref<Cocktail | null>(null)
const deleteTarget = ref<Cocktail | null>(null)

// See IngredientList.vue for why this is a plain variable, not read from
// deleteTarget inside confirmDelete: Reka UI's AlertDialogAction closes the
// dialog (nulling deleteTarget via @update:open) before our @click runs.
let pendingDeleteCocktail: Cocktail | null = null

function openCreate() {
  editingCocktail.value = null
  formOpen.value = true
}

function openEdit(cocktail: Cocktail) {
  editingCocktail.value = cocktail
  formOpen.value = true
}

function requestDelete(cocktail: Cocktail) {
  pendingDeleteCocktail = cocktail
  deleteTarget.value = cocktail
}

async function confirmDelete() {
  const target = pendingDeleteCocktail
  if (!target) return
  pendingDeleteCocktail = null
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
      <h2 class="text-lg font-semibold">Cocktails</h2>
      <Button size="icon" aria-label="Add cocktail" @click="openCreate">
        <Plus />
      </Button>
    </div>

    <p v-if="!isLoading && cocktails?.length === 0" class="text-muted-foreground text-sm">
      No cocktails yet.
    </p>

    <Card v-for="cocktail in cocktails" :key="cocktail.id">
      <CardHeader>
        <CardTitle>{{ cocktail.name }}</CardTitle>
        <CardAction class="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            :aria-label="`Edit ${cocktail.name}`"
            @click="openEdit(cocktail)"
          >
            <Pencil class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            :aria-label="`Delete ${cocktail.name}`"
            @click="requestDelete(cocktail)"
          >
            <Trash2 class="text-destructive size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent class="text-muted-foreground text-sm">
        {{ cocktail.ingredients.map((i) => `${i.name} ${i.amount_percentage}%`).join(' · ') }}
      </CardContent>
    </Card>

    <CocktailFormDialog v-model:open="formOpen" :cocktail="editingCocktail" />

    <AlertDialog :open="!!deleteTarget" @update:open="(value) => !value && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {{ deleteTarget?.name }}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
