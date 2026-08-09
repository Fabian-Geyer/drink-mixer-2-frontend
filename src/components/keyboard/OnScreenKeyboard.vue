<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { useUiStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'

const ui = useUiStore()
const keyboardRef = ref<HTMLDivElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)
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

onUnmounted(() => {
  keyboard?.destroy()
  document.documentElement.style.removeProperty('--keyboard-space')
})

// The on-screen keyboard keeps its own internal buffer - resync it whenever
// a different field becomes active (or clear it once no field is active).
// Also publishes its own rendered height as a CSS var so anything fixed to
// the bottom of the screen (dialogs, in particular) can reserve room for
// it instead of being covered - on the 480px kiosk viewport there usually
// isn't room for both a dialog and the keyboard to just coexist.
watch(
  () => ui.activeField,
  async (field) => {
    keyboard?.setInput(field?.value ?? '')
    await nextTick()
    // Distance from the viewport bottom to the keyboard's top edge, not
    // just its own height - it's also offset above the bottom of the
    // screen to sit above the nav bar, and that gap needs reserving too.
    const height =
      field && wrapperRef.value
        ? window.innerHeight - wrapperRef.value.getBoundingClientRect().top
        : 0
    document.documentElement.style.setProperty('--keyboard-space', `${height}px`)
    if (field) {
      await nextTick()
      document.activeElement?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  },
  { immediate: true },
)
</script>

<template>
  <!--
    pointer-events-auto: Reka UI's Dialog sets pointer-events:none on
    <body> while open, to block interaction with anything outside its own
    portaled content. This keyboard is a global sibling (not teleported
    into the dialog), so without this override it'd be visible but
    entirely unclickable whenever a dialog is open - exactly when it's
    actually needed.
  -->
  <div
    ref="wrapperRef"
    v-show="ui.activeField"
    data-onscreen-keyboard
    class="border-border bg-card pointer-events-auto fixed inset-x-0 bottom-16 z-[60] border-t p-2 shadow-lg"
  >
    <div ref="keyboardRef" class="simple-keyboard" />
    <div class="mt-2 flex justify-end">
      <Button variant="secondary" @click="ui.closeKeyboard()"> Done </Button>
    </div>
  </div>
</template>
