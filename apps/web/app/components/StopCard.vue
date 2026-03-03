<script setup lang="ts">
import type { StopItem } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  stop: StopItem
  readonly?: boolean
}>(), {
  readonly: false,
})

const { getCategoryMeta } = useTripMeta()
const currentPhotoIndex = ref(0)

const photoUrls = computed(() => props.stop.photoUrls)
const activePhoto = computed(() => {
  if (props.readonly) {
    return photoUrls.value[0] ?? null
  }

  return photoUrls.value[currentPhotoIndex.value] ?? null
})
const categoryMeta = computed(() => getCategoryMeta(props.stop.category))
const coordinateText = computed(() => {
  if (props.stop.latitude == null || props.stop.longitude == null) {
    return null
  }

  return `${props.stop.latitude.toFixed(3)}, ${props.stop.longitude.toFixed(3)}`
})

watch(photoUrls, (nextPhotos) => {
  if (props.readonly) {
    return
  }

  if (currentPhotoIndex.value >= nextPhotos.length) {
    currentPhotoIndex.value = 0
  }
}, { immediate: true })

function showPhoto(index: number) {
  if (props.readonly) {
    return
  }

  currentPhotoIndex.value = index
}
</script>

<template>
  <article class="card-base overflow-hidden p-0">
    <div class="grid gap-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div class="relative min-h-52 overflow-hidden bg-elevated">
        <img
          v-if="activePhoto"
          :src="activePhoto"
          :alt="props.stop.name"
          class="h-full w-full object-cover"
        >
        <div v-else class="hero-backdrop flex h-full min-h-52 items-center justify-center">
          <div class="glass-card flex flex-col items-center gap-3 px-6 py-5 text-center">
            <UIcon :name="categoryMeta.icon" class="size-8 text-primary" />
            <p class="text-sm font-medium text-toned">
              Add photos to give this stop more context.
            </p>
          </div>
        </div>

        <div v-if="!props.readonly && photoUrls.length > 1" class="absolute right-3 bottom-3 left-3 flex gap-2 overflow-x-auto">
          <UButton
            v-for="(photoUrl, index) in photoUrls"
            :key="photoUrl"
            color="neutral"
            size="xs"
            :variant="index === currentPhotoIndex ? 'solid' : 'soft'"
            class="shrink-0"
            @click="showPhoto(index)"
          >
            {{ index + 1 }}
          </UButton>
        </div>
      </div>

      <div class="p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge variant="subtle" color="primary">
                <UIcon :name="categoryMeta.icon" class="mr-1 size-3.5" />
                {{ categoryMeta.label }}
              </UBadge>
              <UBadge variant="soft" color="neutral">
                Stop {{ props.stop.sortOrder }}
              </UBadge>
            </div>
            <h4 class="mt-3 font-display text-2xl font-semibold text-highlighted">
              {{ props.stop.name }}
            </h4>
          </div>

          <UButton
            v-if="props.stop.url"
            :to="props.stop.url"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-lucide-external-link"
          >
            Open
          </UButton>
        </div>

        <p v-if="props.stop.description" class="mt-4 text-sm leading-7 text-toned">
          {{ props.stop.description }}
        </p>

        <div class="mt-5 grid gap-3 text-sm text-toned sm:grid-cols-2">
          <div class="inline-flex items-center gap-2 rounded-2xl bg-default px-3 py-2">
            <UIcon name="i-lucide-map-pinned" class="size-4 text-primary" />
            <span>{{ props.stop.address || 'Address coming soon' }}</span>
          </div>
          <div v-if="coordinateText" class="inline-flex items-center gap-2 rounded-2xl bg-default px-3 py-2">
            <UIcon name="i-lucide-navigation" class="size-4 text-primary" />
            <span>{{ coordinateText }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
