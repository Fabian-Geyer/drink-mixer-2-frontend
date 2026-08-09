import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useUiStore } from './ui'

describe('useUiStore', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts locked and persists unlock to sessionStorage', async () => {
    const ui = useUiStore()
    expect(ui.pinUnlocked).toBe(false)

    ui.pinUnlocked = true
    await nextTick()

    expect(sessionStorage.getItem('coma2.pinUnlocked')).toBe('true')
  })

  it('picks up a previously-unlocked session', () => {
    sessionStorage.setItem('coma2.pinUnlocked', 'true')

    const ui = useUiStore()

    expect(ui.pinUnlocked).toBe(true)
  })

  it('tracks and clears the pending PIN-gate redirect target', () => {
    const ui = useUiStore()

    ui.requestPinGate('/barkeeper')
    expect(ui.pinGateTarget).toBe('/barkeeper')

    ui.cancelPinGate()
    expect(ui.pinGateTarget).toBeNull()
  })

  it('routes on-screen keyboard input to the active field callback', () => {
    const ui = useUiStore()
    const onInput = vi.fn()

    ui.openKeyboardFor('Vodka', onInput)
    expect(ui.activeField?.value).toBe('Vodka')

    ui.activeField?.onInput('Vodka Gin')
    expect(onInput).toHaveBeenCalledWith('Vodka Gin')

    ui.closeKeyboard()
    expect(ui.activeField).toBeNull()
  })
})
