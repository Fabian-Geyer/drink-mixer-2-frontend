<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import IngredientList from '@/components/barkeeper/IngredientList.vue'
</script>

<template>
  <div class="flex h-full flex-col p-4">
    <h1 class="mb-3 text-xl font-semibold">Barkeeper</h1>
    <Tabs default-value="ingredients" class="min-h-0 flex-1">
      <TabsList>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="cocktails">Cocktails</TabsTrigger>
      </TabsList>
      <TabsContent value="ingredients" class="overflow-y-auto">
        <IngredientList />
      </TabsContent>
      <TabsContent value="cocktails" class="overflow-y-auto"> Coming soon. </TabsContent>
    </Tabs>
  </div>
</template>
