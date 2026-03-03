<script setup lang="ts">
import type { TripMutationInput } from '~/types/drift-map'

const { createTrip } = useTripsApi()

const state = reactive<TripMutationInput>({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  coverImageKey: null,
  isPublic: false,
})

const loading = ref(false)
const errorMessage = ref('')

useSeo({
  title: 'Create a trip',
  description: 'Start a new DriftMap itinerary with dates, notes, a cover image, and a clean share slug from the beginning.',
  ogImage: {
    title: 'Create a trip',
    description: 'Start a new DriftMap itinerary.',
    icon: '✈️',
  },
})

useWebPageSchema({
  name: 'Create a trip',
  description: 'Start a new DriftMap itinerary with dates, notes, a cover image, and a clean share slug from the beginning.',
})

function updateCover(nextKeys: string[]) {
  state.coverImageKey = nextKeys[0] || null
}

function setVisibility(isPublic: boolean) {
  state.isPublic = isPublic
}

function handleUploadError(message: string) {
  errorMessage.value = message
}

async function submitTrip() {
  errorMessage.value = ''
  loading.value = true

  try {
    const trip = await createTrip(state)
    await navigateTo(`/trips/${trip.id}/edit`)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create trip.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-[2.25rem] border border-default/70 bg-default/70 p-6 shadow-card sm:p-8">
      <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
        New itinerary
      </p>
      <h1 class="mt-3 font-display text-4xl font-semibold text-highlighted sm:text-5xl">
        Create a trip that is ready to share later.
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-8 text-toned">
        Start with the essentials. You can refine days, stops, photos, and collaborators immediately after creation.
      </p>
    </section>

    <UCard class="glass-card form-container p-6 sm:p-8">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        title="Unable to create trip"
        :description="errorMessage"
        class="mb-6"
      />

      <UForm :state="state" class="form-section" @submit="submitTrip">
        <UFormField label="Trip title">
          <UInput v-model="state.title" class="w-full" placeholder="Northern Spain workcation" />
        </UFormField>

        <div class="form-row">
          <UFormField label="Start date">
            <UInput v-model="state.startDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="End date">
            <UInput v-model="state.endDate" type="date" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Trip summary">
          <UTextarea
            v-model="state.description"
            :rows="5"
            class="w-full"
            placeholder="Describe the pace, goals, vibe, and who this itinerary is for."
          />
        </UFormField>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-highlighted">
            Visibility
          </p>
          <div class="flex gap-2">
            <UButton
              type="button"
              color="neutral"
              :class="state.isPublic ? 'bg-default text-toned' : 'bg-primary text-inverted shadow-card'"
              @click="setVisibility(false)"
            >
              Private draft
            </UButton>
            <UButton
              type="button"
              color="neutral"
              :class="state.isPublic ? 'bg-primary text-inverted shadow-card' : 'bg-default text-toned'"
              @click="setVisibility(true)"
            >
              Public when created
            </UButton>
          </div>
        </div>

        <PhotoUploader
          :model-value="state.coverImageKey ? [state.coverImageKey] : []"
          label="Cover photo"
          @update:model-value="updateCover"
          @error="handleUploadError"
        />

        <div class="flex justify-end">
          <UButton type="submit" color="primary" size="lg" icon="i-lucide-arrow-right" :loading="loading">
            Create trip
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
