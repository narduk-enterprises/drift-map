<script setup lang="ts">
const route = useRoute()
const tripId = computed(() => route.params.id as string)

const { data: trip, status, error, refresh } = await useTripDetailData(tripId)

const coverStyle = computed(() => {
  if (!trip.value?.coverImageUrl) {
    return
  }

  return {
    backgroundImage: `linear-gradient(135deg, rgb(15 118 110 / 0.12), rgb(8 145 178 / 0.16)), url('${trip.value.coverImageUrl}')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
})

if (trip.value) {
  useSeo({
    title: `${trip.value.title} itinerary`,
    description: trip.value.description || 'A detailed travel itinerary built in DriftMap.',
    ...(trip.value.coverImageUrl
      ? { image: trip.value.coverImageUrl }
      : { ogImage: {
          title: trip.value.title,
          description: trip.value.description || 'A detailed travel itinerary built in DriftMap.',
          icon: '🧭',
        } }),
  })

  useWebPageSchema({
    name: trip.value.title,
    description: trip.value.description || 'A detailed travel itinerary built in DriftMap.',
  })
}
else {
  useSeo({
    title: 'Trip detail',
    description: 'Review a day-by-day itinerary in DriftMap.',
    ogImage: {
      title: 'Trip detail',
      description: 'Review a day-by-day itinerary in DriftMap.',
      icon: '🧭',
    },
  })

  useWebPageSchema({
    name: 'Trip detail',
    description: 'Review a day-by-day itinerary in DriftMap.',
  })
}

function refreshTrip() {
  void refresh()
}
</script>

<template>
  <div class="space-y-8">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Unable to load this trip"
      :description="error.message"
    />

    <div v-else-if="status === 'pending'" class="space-y-6">
      <div class="card-base h-80 animate-pulse" />
      <div class="card-base h-28 animate-pulse" />
      <div class="card-base h-64 animate-pulse" />
    </div>

    <template v-else-if="trip">
      <section
        class="terrain-lines overflow-hidden rounded-[2.5rem] border border-default/70 p-6 text-inverted shadow-overlay sm:p-10"
        :class="trip.coverImageUrl ? '' : 'hero-backdrop'"
        :style="coverStyle"
      >
        <div class="max-w-3xl">
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary" variant="solid">
              {{ trip.dayCount }} days
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ trip.stopCount }} stops
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ trip.isPublic ? 'Public sharing on' : 'Private draft' }}
            </UBadge>
          </div>

          <h1 class="mt-6 font-display text-5xl font-semibold sm:text-6xl">
            {{ trip.title }}
          </h1>
          <p class="mt-5 max-w-2xl text-sm leading-8 text-inverted/85 sm:text-base">
            {{ trip.description || 'A collaborative itinerary with room for structure, photos, and polished sharing.' }}
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <UButton :to="`/trips/${trip.id}/edit`" color="primary" size="lg" icon="i-lucide-pencil-line">
              Edit itinerary
            </UButton>
            <UButton color="neutral" variant="soft" size="lg" icon="i-lucide-refresh-cw" @click="refreshTrip">
              Refresh
            </UButton>
          </div>
        </div>
      </section>

      <ShareBanner :share-url="trip.shareUrl" :is-public="trip.isPublic" />

      <section class="space-y-6">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Day by day
            </p>
            <h2 class="mt-2 font-display text-4xl font-semibold text-highlighted">
              The itinerary
            </h2>
          </div>
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
            <img src="/images/empty-trips.svg" alt="No itinerary days" class="w-full max-w-xs">
            <div>
              <h3 class="font-display text-4xl font-semibold text-highlighted">
                No itinerary days yet
              </h3>
              <p class="mt-4 max-w-xl text-sm leading-8 text-toned">
                Open the editor to add structured days, notes, and stops for this route.
              </p>
              <UButton :to="`/trips/${trip.id}/edit`" color="primary" class="mt-6" icon="i-lucide-pencil-line">
                Open editor
              </UButton>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
