<script setup lang="ts">
useSeo({
  title: 'Collaborative travel planning for real itineraries',
  description: 'Build day-by-day trips with stops, photos, notes, and shareable public pages that look polished on every device.',
  ogImage: {
    title: 'DriftMap',
    description: 'Collaborative travel planning for real itineraries.',
    icon: '🧭',
  },
})

useWebPageSchema({
  name: 'DriftMap',
  description: 'Build day-by-day trips with stops, photos, notes, and shareable public pages that look polished on every device.',
})

const featureCards = [
  {
    title: 'Shape each day clearly',
    description: 'Map out arrival days, working sessions, dinner reservations, and spontaneous stops without losing the thread.',
    icon: 'i-lucide-calendar-fold',
  },
  {
    title: 'Collaborate without chaos',
    description: 'Invite friends, clients, or travel crews into a single itinerary workspace with structured read-only sharing.',
    icon: 'i-lucide-users-round',
  },
  {
    title: 'Keep the story visual',
    description: 'Attach photos, cover imagery, and rich public previews so the itinerary feels like a live travel journal.',
    icon: 'i-lucide-image-up',
  },
]

const sampleMoments = [
  'Arrival breakfast in Lisbon',
  'Train transfer to Porto',
  'Sunset winery reservation',
]
</script>

<template>
  <div class="space-y-14 pb-10">
    <section class="terrain-lines overflow-hidden rounded-[2.5rem] border border-default/70 bg-default/70 shadow-overlay hero-backdrop">
      <div class="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,24rem)] lg:px-12 lg:py-14">
        <div class="animate-drift-in">
          <p class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase text-primary">
            <UIcon name="i-lucide-compass" class="size-4" />
            Premium itinerary workspace
          </p>

          <h1 class="mt-5 max-w-3xl font-display text-5xl leading-tight font-semibold text-highlighted sm:text-6xl">
            Plan a trip that reads like a polished travel journal.
          </h1>

          <p class="mt-5 max-w-2xl text-base leading-8 text-toned sm:text-lg">
            DriftMap brings structure to collaborative travel planning. Build day-by-day routes, collect stops with photos and notes, then publish a read-only share page with rich previews.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <UButton to="/trips/new" color="primary" size="xl" icon="i-lucide-route">
              Create your first trip
            </UButton>
            <UButton to="/trips" color="neutral" variant="outline" size="xl" icon="i-lucide-map">
              Open dashboard
            </UButton>
          </div>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div
              v-for="moment in sampleMoments"
              :key="moment"
              class="glass-card animate-pulse-float px-4 py-4"
            >
              <p class="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                Sample stop
              </p>
              <p class="mt-2 text-sm font-medium text-highlighted">
                {{ moment }}
              </p>
            </div>
          </div>
        </div>

        <div class="animate-drift-in lg:pl-4">
          <UCard class="glass-card overflow-hidden p-0">
            <div class="rounded-[2rem] p-6">
              <div class="rounded-[1.75rem] bg-default px-5 py-5 shadow-card">
                <p class="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                  Example itinerary
                </p>
                <h2 class="mt-3 font-display text-3xl font-semibold text-highlighted">
                  Pacific Coast reset
                </h2>
                <p class="mt-3 text-sm leading-7 text-toned">
                  A five-day working retreat with coastal drives, design sessions, favorite coffee stops, and share-ready notes for the whole team.
                </p>
                <div class="mt-5 flex flex-wrap gap-2">
                  <UBadge color="primary" variant="subtle">
                    5 days
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    16 stops
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    Public share page
                  </UBadge>
                </div>
              </div>

              <div class="mt-5 space-y-3">
                <div class="rounded-3xl border border-default/70 bg-default px-4 py-4">
                  <p class="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                    Day 1
                  </p>
                  <p class="mt-2 font-medium text-highlighted">
                    Arrival, neighborhood walk, dinner booking
                  </p>
                </div>
                <div class="rounded-3xl border border-default/70 bg-default px-4 py-4">
                  <p class="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                    Day 2
                  </p>
                  <p class="mt-2 font-medium text-highlighted">
                    Studio work block, scenic drive, sunset stop
                  </p>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-3">
      <UCard
        v-for="card in featureCards"
        :key="card.title"
        class="card-base p-6"
      >
        <div class="inline-flex size-12 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          <UIcon :name="card.icon" class="size-6" />
        </div>
        <h2 class="mt-5 font-display text-2xl font-semibold text-highlighted">
          {{ card.title }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-toned">
          {{ card.description }}
        </p>
      </UCard>
    </section>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <UCard class="card-base p-7">
        <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
          Why teams switch
        </p>
        <h2 class="mt-3 font-display text-4xl font-semibold text-highlighted">
          Notion flexibility, travel-first structure.
        </h2>
        <p class="mt-4 max-w-2xl text-sm leading-8 text-toned">
          Most tools make you choose between a rigid spreadsheet and a loose notes doc. DriftMap keeps the elegant parts of both: visual structure, fast editing, and beautiful public sharing when the plan is ready.
        </p>
      </UCard>

      <div class="space-y-4">
        <UCard class="glass-card p-6">
          <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
            Mobile-first
          </p>
          <p class="mt-3 text-sm leading-7 text-toned">
            Built for the moment you are standing on a sidewalk, double-checking the next stop.
          </p>
        </UCard>
        <UCard class="glass-card p-6">
          <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
            Social preview ready
          </p>
          <p class="mt-3 text-sm leading-7 text-toned">
            Every shared trip can carry a cover image, descriptive meta tags, and a cleaner first impression.
          </p>
        </UCard>
      </div>
    </section>
  </div>
</template>
