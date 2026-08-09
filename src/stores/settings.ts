import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'coma2.backendUrl'

export const useSettingsStore = defineStore('settings', () => {
  const backendUrl = ref(
    localStorage.getItem(STORAGE_KEY) ??
      import.meta.env.VITE_BACKEND_URL ??
      'http://127.0.0.1:5055',
  )

  watch(backendUrl, (value) => {
    localStorage.setItem(STORAGE_KEY, value)
  })

  return { backendUrl }
})
