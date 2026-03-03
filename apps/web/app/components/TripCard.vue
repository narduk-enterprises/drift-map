<script setup lang="ts">
import type { TripSummary } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  trip: TripSummary
  showDelete?: boolean
}>(), {
  showDelete: false,
})

const emit = defineEmits<{
  delete: [tripId: string]
}>()

const { formatTripRange } = useTripMeta()

const dateRange = computed(() => formatTripRange(props.trip.startDate, props.trip.endDate))
const coverStyle = computed(() => {
  if (!props.trip.coverImageUrl) {
    return
  }

  return {
    backgroundImage: `linear-gradient(135deg, rgb(15 118 110 / 0.1), rgb(8 145 178 / 0.12)), url('${props.trip.coverImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

function handleDelete() {
  emit('delete', props.trip.id)
}
</script>

<template>
  <UCard class="card-base h-full overflow-hidden">
    <div class="flex h-full flex-col gap-5">
      <div
        class="flex h-48 items-end rounded-3xl p-5 text-inverted shadow-card"
        :class="props.trip.coverImageUrl ? '' : 'hero-backdrop'"
        :style="coverStyle"
      >
        <div class="glass rounded-3xl px-4 py-3">
          <p class="text-xs font-semibold tracking-[0.24em] uppercase text-inverted/80">
            {{ props.trip.isPublic ? 'Public itinerary' : 'Private workspace' }}
          </p>
          <h3 class="mt-1 font-display text-2xl font-semibold">
            {{ props.trip.title }}
          </h3>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4">
        <p class="line-clamp-3 text-sm leading-6 text-toned">
          {{ props.trip.description || 'A collaborative itinerary ready for stops, notes, and shared memories.' }}
        </p>

        <div class="flex flex-wrap gap-2">
          <UBadge variant="subtle" color="primary">
            {{ dateRange }}
          </UBadge>
          <UBadge variant="subtle" color="neutral">
            {{ props.trip.dayCount }} days
          </UBadge>
          <UBadge variant="subtle" color="neutral">
            {{ props.trip.stopCount }} stops
          </UBadge>
        </div>

        <div class="mt-auto flex items-center justify-between gap-3">
          <div class="flex gap-2">
            <UButton :to="`/trips/${props.trip.id}`" color="primary" icon="i-lucide-book-open">
              View
            </UButton>
            <UButton :to="`/trips/${props.trip.id}/edit`" color="neutral" variant="outline" icon="i-lucide-pencil-line">
              Edit
            </UButton>
          </div>

          <UButton
            v-if="props.showDelete"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            aria-label="Delete trip"
            @click="handleDelete"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
