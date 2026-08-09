<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useUiStore } from '@/stores/ui'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ui = useUiStore()

function onFocus() {
  ui.openKeyboardFor(props.modelValue, (value) => emit('update:modelValue', value))
}
</script>

<template>
  <Input
    :model-value="modelValue"
    :placeholder="placeholder"
    :class="props.class"
    @update:model-value="(value) => emit('update:modelValue', String(value))"
    @focus="onFocus"
  />
</template>
