<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { XIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import DialogOverlay from './DialogOverlay.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<
    DialogContentProps & { class?: HTMLAttributes['class']; showCloseButton?: boolean }
  >(),
  {
    showCloseButton: true,
  },
)
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// The on-screen keyboard (OnScreenKeyboard.vue) is a global sibling, not
// inside this dialog's own portaled content - without this, Reka UI treats
// every tap on it as an "outside" interaction and dismisses the dialog,
// which is exactly what's open when the keyboard is actually in use.
function ignoreOnScreenKeyboardOutsideInteraction(event: Event) {
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-onscreen-keyboard]')) {
    event.preventDefault()
  }
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      @interact-outside="ignoreOnScreenKeyboardOutsideInteraction"
      :class="
        cn(
          // Anchored near the top (not vertically centered) and capped to
          // the viewport height (minus whatever the on-screen keyboard is
          // currently using, via --keyboard-space - see OnScreenKeyboard.vue)
          // with internal scroll: on the 480px-tall kiosk screen, a centered
          // dialog collides with the keyboard docked at the bottom whenever
          // a field inside it is focused - staying up top and shrinking
          // keeps the focused field visible instead of hidden underneath it.
          'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem-var(--keyboard-space,0px))] gap-4 overflow-y-auto rounded-xl p-4 text-sm ring-1 duration-100 sm:max-w-sm fixed top-4 left-1/2 z-50 w-full -translate-x-1/2 outline-none',
          props.class,
        )
      "
    >
      <slot />

      <DialogClose v-if="showCloseButton" data-slot="dialog-close" as-child>
        <Button variant="ghost" class="absolute top-2 right-2" size="icon-sm">
          <XIcon />
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
