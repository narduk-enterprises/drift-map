<script setup lang="ts">
const props = defineProps<{
  shareUrl: string
  isPublic: boolean
}>()

const copied = ref(false)
const copyError = ref('')

const copyStatusMessage = computed(() => {
  if (!props.isPublic) {
    return 'Turn on public sharing in the editor before sending this read-only link.'
  }

  if (copyError.value) {
    return copyError.value
  }

  if (copied.value) {
    return 'Share link copied to your clipboard.'
  }

  return 'Use the copy button to share the read-only itinerary.'
})

async function copyShareUrl() {
  copied.value = false
  copyError.value = ''

  if (!import.meta.client) {
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.shareUrl)
      copied.value = true
      return
    }

    throw new Error('Clipboard access is unavailable in this browser.')
  }
  catch (error) {
    copyError.value = error instanceof Error ? error.message : 'Unable to copy the share link.'
  }
}
</script>

<template>
  <UCard class="glass-card overflow-hidden">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
          {{ props.isPublic ? 'Public link ready' : 'Private trip draft' }}
        </p>
        <p class="mt-2 text-sm leading-6 text-toned">
          {{ props.isPublic ? 'Share this read-only itinerary with your travel group, family, or clients.' : 'Turn on public sharing in the editor to publish a read-only version.' }}
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:min-w-[22rem]">
        <UInput :model-value="props.shareUrl" readonly class="w-full" />
        <div class="flex items-center gap-3">
          <UButton color="primary" icon="i-lucide-copy" :disabled="!props.isPublic" @click="copyShareUrl">
            {{ copied ? 'Copied' : 'Copy link' }}
          </UButton>
          <span
            class="min-h-5 text-xs"
            :class="copyError ? 'text-error' : 'text-muted'"
            role="status"
            aria-live="polite"
          >
            {{ copyStatusMessage }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>
