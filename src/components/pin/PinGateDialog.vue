<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PinPad from './PinPad.vue'

const ui = useUiStore()
const router = useRouter()
const error = ref(false)

const open = computed({
  get: () => ui.pinGateTarget !== null,
  set: (value: boolean) => {
    if (!value) ui.cancelPinGate()
  },
})

watch(open, (isOpen) => {
  if (!isOpen) error.value = false
})

function handleSubmit(code: string) {
  if (code === import.meta.env.VITE_ADMIN_PIN) {
    ui.pinUnlocked = true
    error.value = false
    const target = ui.pinGateTarget
    ui.cancelPinGate()
    if (target) router.push(target)
  } else {
    error.value = true
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xs">
      <DialogHeader>
        <DialogTitle>Enter PIN</DialogTitle>
        <DialogDescription>This area is locked. Enter the admin PIN to continue.</DialogDescription>
      </DialogHeader>
      <PinPad :error="error" @submit="handleSubmit" />
    </DialogContent>
  </Dialog>
</template>
