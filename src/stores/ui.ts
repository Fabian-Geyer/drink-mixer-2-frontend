import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const PIN_UNLOCKED_KEY = 'coma2.pinUnlocked'

interface ActiveKeyboardField {
  value: string
  onInput: (value: string) => void
}

export const useUiStore = defineStore('ui', () => {
  const pinUnlocked = ref(sessionStorage.getItem(PIN_UNLOCKED_KEY) === 'true')

  watch(pinUnlocked, (value) => {
    sessionStorage.setItem(PIN_UNLOCKED_KEY, String(value))
  })

  const activeField = ref<ActiveKeyboardField | null>(null)

  function openKeyboardFor(value: string, onInput: (value: string) => void) {
    activeField.value = { value, onInput }
  }

  function closeKeyboard() {
    activeField.value = null
  }

  // Set by the router guard when navigation to a requiresPin route is
  // blocked - the path to resume once PinGateDialog confirms the PIN.
  const pinGateTarget = ref<string | null>(null)

  function requestPinGate(target: string) {
    pinGateTarget.value = target
  }

  function cancelPinGate() {
    pinGateTarget.value = null
  }

  return {
    pinUnlocked,
    activeField,
    openKeyboardFor,
    closeKeyboard,
    pinGateTarget,
    requestPinGate,
    cancelPinGate,
  }
})
