<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: trip, error, status } = await useSharedTripData(slug)

const coverStyle = computed(() => {
  if (!trip.value?.coverImageUrl) {
    return
  }

  return {
    backgroundImage: `linear-gradient(135deg, rgb(15 118 110 / 0.16), rgb(8 145 178 / 0.14)), url('${trip.value.coverImageUrl}')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
})

if (trip.value) {
  useSeo({
    title: `${trip.value.title} | Shared trip`,
    description: trip.value.description || `Explore the shared itinerary for ${trip.value.title}.`,
    ...(trip.value.coverImageUrl
      ? { image: trip.value.coverImageUrl }
      : { ogImage: {
          title: trip.value.title,
          description: trip.value.description || `Explore the shared itinerary for ${trip.value.title}.`,
          icon: '🗺️',
        } }),
    canonicalUrl: trip.value.shareUrl,
  })

  useWebPageSchema({
    name: trip.value.title,
    description: trip.value.description || `Explore the shared itinerary for ${trip.value.title}.`,
  })
}
else {
  useSeo({
    title: 'Shared trip',
    description: 'Explore a read-only DriftMap itinerary.',
    ogImage: {
      title: 'Shared trip',
      description: 'Explore a read-only DriftMap itinerary.',
      icon: '🗺️',
    },
  })

  useWebPageSchema({
    name: 'Shared trip',
    description: 'Explore a read-only DriftMap itinerary.',
  })
}
</script>

<template>
  <div class="space-y-8">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Shared trip not found"
      :description="error.message"
    />

    <div v-else-if="status === 'pending'" class="space-y-6">
      <div class="card-base h-72 animate-pulse" />
      <div class="card-base h-60 animate-pulse" />
    </div>

    <template v-else-if="trip">
      <section
        class="terrain-lines overflow-hidden rounded-[2.5rem] border border-default/70 p-6 text-inverted shadow-overlay sm:p-10"
        :class="trip.coverImageUrl ? '' : 'hero-backdrop'"
        :style="coverStyle"
      >
        <div class="max-w-3xl">
          <p class="inline-flex items-center gap-2 rounded-full bg-default/20 px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase">
            <UIcon name="i-lucide-globe-2" class="size-4" />
            Shared with DriftMap
          </p>

          <h1 class="mt-5 font-display text-5xl font-semibold sm:text-6xl">
            {{ trip.title }}
          </h1>

          <p class="mt-5 max-w-2xl text-sm leading-8 text-inverted/85 sm:text-base">
            {{ trip.description || 'A shared itinerary with a clear day-by-day route, curated stops, and visual context.' }}
          </p>

          <div class="mt-7 flex flex-wrap gap-2">
            <UBadge color="primary" variant="solid">
              {{ trip.dayCount }} days
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ trip.stopCount }} stops
            </UBadge>
            <UBadge color="neutral" variant="soft">
              Read-only
            </UBadge>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div>
          <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
            Shared itinerary
          </p>
          <h2 class="mt-2 font-display text-4xl font-semibold text-highlighted">
            Follow the route
          </h2>
        </div>

        <div v-if="trip.days.length" class="space-y-6">
          <DayTimeline
            v-for="day in trip.days"
            :key="day.id"
            :day="day"
            :readonly="true"
          />
        </div>

        <div v-else class="glass-card overflow-hidden p-8 sm:p-10">
          <div class="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-center">
            <img src="/images/empty-shared-trip.svg" alt="No shared itinerary yet" class="w-full max-w-xs">
            <div>
              <h3 class="font-display text-4xl font-semibold text-highlighted">
                The route is still taking shape
              </h3>
              <p class="mt-4 max-w-xl text-sm leading-8 text-toned">
                This trip has been shared, but the detailed day-by-day stops are still being added.
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
