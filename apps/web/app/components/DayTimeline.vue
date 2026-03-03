<script setup lang="ts">
import type { TripDayItem } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  day: TripDayItem
  readonly?: boolean
}>(), {
  readonly: false,
})

const { formatFullDate } = useTripMeta()

const expanded = ref(!props.readonly)
const formattedDate = computed(() => formatFullDate(props.day.date))
const isExpanded = computed(() => props.readonly || expanded.value)
const stopLabel = computed(() => `${props.day.stops.length} ${props.day.stops.length === 1 ? 'stop' : 'stops'}`)

function toggleExpanded() {
  if (props.readonly) {
    return
  }

  expanded.value = !expanded.value
}
</script>

<template>
  <section class="relative rounded-[2rem] border border-default/70 bg-default/80 p-5 shadow-card backdrop-blur-sm sm:p-7">
    <div class="absolute top-7 left-7 bottom-7 hidden w-px bg-linear-to-b from-primary/30 via-primary/10 to-transparent sm:block" />

    <div class="relative z-1 flex flex-col gap-6 sm:pl-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="subtle">
              Day {{ props.day.dayNumber }}
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ stopLabel }}
            </UBadge>
          </div>

          <h3 class="mt-4 font-display text-3xl font-semibold text-highlighted">
            {{ props.day.title || `Day ${props.day.dayNumber}` }}
          </h3>
          <p class="mt-2 text-sm text-toned">
            {{ formattedDate }}
          </p>
        </div>

        <UButton
          v-if="!props.readonly"
          color="neutral"
          variant="ghost"
          :icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          @click="toggleExpanded"
        >
          {{ expanded ? 'Collapse' : 'Expand' }}
        </UButton>
      </div>

      <p v-if="props.day.notes" class="rounded-3xl bg-default px-4 py-4 text-sm leading-7 text-toned">
        {{ props.day.notes }}
      </p>

      <div v-if="isExpanded" class="space-y-5">
        <div v-if="props.day.stops.length" class="space-y-4">
          <StopCard
            v-for="stop in props.day.stops"
            :key="stop.id"
            :stop="stop"
            :readonly="props.readonly"
          />
        </div>

        <div v-else class="glass-card flex flex-col items-center gap-3 p-8 text-center">
          <UIcon name="i-lucide-route" class="size-8 text-primary" />
          <p class="font-medium text-highlighted">
            No stops added yet
          </p>
          <p class="max-w-md text-sm leading-6 text-toned">
            This day is open for new reservations, restaurant finds, and local discoveries.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
