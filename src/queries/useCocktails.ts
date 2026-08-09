import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createApiClient } from '@/lib/api-client'
import { useSettingsStore } from '@/stores/settings'
import type { Cocktail, CocktailCreate, CocktailUpdate } from '@/types/api'

export function useCocktailsQuery() {
  const settings = useSettingsStore()
  return useQuery({
    queryKey: ['cocktails'],
    queryFn: () => createApiClient(settings.backendUrl).get<Cocktail[]>('/api/cocktails'),
  })
}

export function useCreateCocktailMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CocktailCreate) =>
      createApiClient(settings.backendUrl).post<Cocktail>('/api/cocktails', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cocktails'] }),
  })
}

export function useUpdateCocktailMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CocktailUpdate }) =>
      createApiClient(settings.backendUrl).put<Cocktail>(`/api/cocktails/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cocktails'] }),
  })
}

export function useDeleteCocktailMutation() {
  const settings = useSettingsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      createApiClient(settings.backendUrl).delete<void>(`/api/cocktails/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cocktails'] }),
  })
}
