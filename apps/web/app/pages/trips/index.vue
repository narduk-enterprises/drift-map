<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { deleteTrip } = useTripsApi()

const currentPage = computed(() => {
  const parsed = Number(route.query.page || '1')
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})

const { data, status, error, refresh } = await useTripsDashboardData(currentPage)

useSeo({
  title: 'Your trips',
  description: 'Review every itinerary in your DriftMap workspace, from private drafts to public share-ready plans.',
  ogImage: {
    title: 'Your trips',
    description: 'Review every itinerary in your DriftMap workspace.',
    icon: '🗺️',
  },
})

useWebPageSchema({
  name: 'Your trips',
  description: 'Review every itinerary in your DriftMap workspace, from private drafts to public share-ready plans.',
})

const deletingId = ref('')

const items = computed(() => data.value?.items || [])
const pagination = computed(() => data.value?.pagination || {
  page: 1,
  pageSize: 9,
  total: 0,
  pageCount: 0,
})
const safePageCount = computed(() => Math.max(pagination.value.pageCount, 1))

async function removeTrip(tripId: string) {
  deletingId.value = tripId

  try {
    await deleteTrip(tripId)
    await refresh()
  }
  finally {
    deletingId.value = ''
  }
}

async function goToPage(page: number) {
  await router.push({
    query: {
      ...route.query,
      page: page > 1 ? String(page) : undefined,
    },
  })
}
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-col gap-6 rounded-[2.25rem] border border-default/70 bg-default/70 p-6 shadow-card sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div>
        <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
          Dashboard
        </p>
        <h1 class="mt-3 font-display text-4xl font-semibold text-highlighted sm:text-5xl">
          Your trips
        </h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-toned">
          Keep all itineraries in one place, jump into editing fast, and share the polished read-only version only when you are ready.
        </p>
      </div>

      <UButton to="/trips/new" color="primary" size="lg" icon="i-lucide-plus">
        Create a trip
      </UButton>
    </section>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Unable to load trips"
      :description="error.message"
    />

    <div v-if="status === 'pending'" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="skeleton in 6"
        :key="skeleton"
        class="card-base h-[23rem] animate-pulse"
      />
    </div>

    <div v-else-if="items.length" class="space-y-8">
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="trip in items" :key="trip.id" class="space-y-3">
          <TripCard :trip="trip" :show-delete="true" @delete="removeTrip" />
          <div v-if="deletingId === trip.id" class="rounded-3xl bg-default px-4 py-3 text-sm text-toned">
            Removing trip...
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 rounded-[2rem] border border-default/70 bg-default/70 px-5 py-4">
        <p class="text-sm text-toned">
          Page {{ pagination.page }} of {{ safePageCount }}
        </p>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-left"
            :disabled="pagination.page <= 1"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-right"
            :disabled="pagination.page >= pagination.pageCount"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="glass-card overflow-hidden p-8 sm:p-10">
      <div class="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-center">
        <img src="/images/empty-trips.svg" alt="No trips yet" class="w-full max-w-xs">
        <div>
          <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
            Empty workspace
          </p>
          <h2 class="mt-3 font-display text-4xl font-semibold text-highlighted">
            Start with one route.
          </h2>
          <p class="mt-4 max-w-xl text-sm leading-8 text-toned">
            Build the first day, add a few anchor stops, and let the itinerary grow from there. DriftMap keeps the structure clear as the trip gets more detailed.
          </p>
          <UButton to="/trips/new" color="primary" class="mt-6" icon="i-lucide-route">
            Create your first trip
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
