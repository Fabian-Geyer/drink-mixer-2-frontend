<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{ error?: boolean; length?: number }>()
const emit = defineEmits<{ submit: [code: string] }>()

const pinLength = props.length ?? (Number(import.meta.env.VITE_ADMIN_PIN?.length) || 4)
const digits = ref<string[]>([])
const showError = ref(false)

// Parent flags a wrong attempt via `error` - flash all dots red until the
// next key press, rather than a setTimeout-based auto-clear.
watch(
  () => props.error,
  (value) => {
    if (value) showError.value = true
  },
)

function resetIfErrored() {
  if (showError.value) {
    digits.value = []
    showError.value = false
  }
}

function press(digit: string) {
  resetIfErrored()
  if (digits.value.length >= pinLength) return
  digits.value.push(digit)
  if (digits.value.length === pinLength) {
    const code = digits.value.join('')
    digits.value = []
    emit('submit', code)
  }
}

function backspace() {
  if (showError.value) {
    resetIfErrored()
    return
  }
  digits.value.pop()
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="flex gap-3"
      role="status"
      :aria-label="`${digits.length} of ${pinLength} digits entered`"
    >
      <div
        v-for="i in pinLength"
        :key="i"
        class="size-4 rounded-full border-2"
        :class="
          showError
            ? 'border-destructive bg-destructive'
            : i <= digits.length
              ? 'bg-primary border-primary'
              : 'border-muted-foreground'
        "
      />
    </div>
    <p class="text-destructive h-5 text-sm">{{ showError ? 'Incorrect PIN - try again' : '' }}</p>
    <div class="grid grid-cols-3 gap-2">
      <Button
        v-for="(key, index) in keys"
        :key="index"
        type="button"
        variant="outline"
        size="icon-lg"
        :disabled="!key"
        :class="{ invisible: !key }"
        @click="key === 'back' ? backspace() : press(key)"
      >
        <span class="text-lg">{{ key === 'back' ? '⌫' : key }}</span>
      </Button>
    </div>
  </div>
</template>
