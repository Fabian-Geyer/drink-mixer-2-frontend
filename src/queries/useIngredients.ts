import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createApiClient } from '@/lib/api-client'
import { useSettingsStore } from '@/stores/settings'
import type { Ingredient, IngredientCreate, IngredientUpdate } from '@/types/api'

export function useIngredientsQuery() {
  const settings = useSettingsStore()
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => createApiClient(settings.backendUrl).get<Ingredient[]>('/api/ingredients'),
  })
}

export function useCreateIngredientMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IngredientCreate) =>
      createApiClient(settings.backendUrl).post<Ingredient>('/api/ingredients', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

export function useUpdateIngredientMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IngredientUpdate }) =>
      createApiClient(settings.backendUrl).put<Ingredient>(`/api/ingredients/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

export function useDeleteIngredientMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      createApiClient(settings.backendUrl).delete<void>(`/api/ingredients/${id}`),
    onSuccess: () => {
      // Deleting an ingredient cascades on the backend: any cocktail
      // requiring it is deleted, and any slot loaded with it is cleared.
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['cocktails'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}
