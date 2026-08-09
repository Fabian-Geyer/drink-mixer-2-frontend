<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { useUiStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'

const ui = useUiStore()
const keyboardRef = ref<HTMLDivElement | null>(null)
let keyboard: Keyboard | null = null
let shifted = false

const layout = {
  default: [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'q w e r t y u i o p',
    'a s d f g h j k l',
    '{shift} z x c v b n m',
    '{space}',
  ],
  shift: [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'Q W E R T Y U I O P',
    'A S D F G H J K L',
    '{shift} Z X C V B N M',
    '{space}',
  ],
}

const display = {
  '{bksp}': '⌫',
  '{shift}': '⇧',
  '{space}': 'space',
}

onMounted(() => {
  if (!keyboardRef.value) return
  keyboard = new Keyboard(keyboardRef.value, {
    onChange: (input: string) => ui.activeField?.onInput(input),
    onKeyPress: (button: string) => {
      if (button === '{shift}') {
        shifted = !shifted
        keyboard?.setOptions({ layoutName: shifted ? 'shift' : 'default' })
      }
    },
    layout,
    display,
  })
})

onUnmounted(() => keyboard?.destroy())

// The on-screen keyboard keeps its own internal buffer - resync it whenever
// a different field becomes active (or clear it once no field is active).
watch(
  () => ui.activeField,
  (field) => keyboard?.setInput(field?.value ?? ''),
)
</script>

<template>
  <div
    v-show="ui.activeField"
    class="border-border bg-card fixed inset-x-0 bottom-16 z-50 border-t p-2 shadow-lg"
  >
    <div ref="keyboardRef" class="simple-keyboard" />
    <div class="mt-2 flex justify-end">
      <Button variant="secondary" @click="ui.closeKeyboard()"> Done </Button>
    </div>
  </div>
</template>
