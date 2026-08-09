export interface Ingredient {
  id: number
  timestamp: string
  name: string
  alcohol_percentage: number
}

export interface IngredientCreate {
  name: string
  alcohol_percentage: number
}

export interface IngredientUpdate {
  name?: string
  alcohol_percentage?: number
}

export interface CocktailIngredient {
  id: number
  name: string
  alcohol_percentage: number
  amount: number
  amount_percentage: number
}

export interface CocktailIngredientInput {
  ingredient_id: number
  amount: number
}

export interface Cocktail {
  id: number
  name: string
  timestamp: string
  ingredients: CocktailIngredient[]
}

export interface CocktailCreate {
  name: string
  ingredients: CocktailIngredientInput[]
}

export interface CocktailUpdate {
  name?: string
  ingredients?: CocktailIngredientInput[]
}

export interface Slot {
  id: number
  ingredient_id: number
  amount_percentage: number
}

export interface SlotUpdate {
  ingredient_id?: number
  amount_percentage?: number
}

export interface Order {
  id: number
  cocktail_id: number
  cocktail_name: string
  created_at: string
  duration_seconds: number
}

export interface OrderCreate {
  cocktail_id: number
}

export type MachineState = 'idle' | 'mixing'

export interface MachineStatus {
  state: MachineState
  current_order: Order | null
  seconds_remaining: number | null
  slots: Slot[]
}
