<script setup lang="ts">
import type {
  CollaboratorRole,
  StopMutationInput,
  TripDayMutationInput,
  TripMutationInput,
} from '~/types/drift-map'

const route = useRoute()
const tripId = computed(() => route.params.id as string)

const {
  getTrip,
  updateTrip,
  deleteTrip,
  addDay,
  updateDay,
  deleteDay,
  addStop,
  updateStop,
  deleteStop,
  inviteCollaborator,
} = useTripsApi()

const { data: trip, error } = await useAsyncData(
  () => `trip-editor-${tripId.value}`,
  async () => await getTrip(tripId.value),
)

const busy = ref(false)
const errorMessage = ref('')

if (trip.value) {
  useSeo({
    title: `Edit ${trip.value.title}`,
    description: `Refine stops, collaborators, and sharing settings for ${trip.value.title}.`,
    ogImage: {
      title: `Edit ${trip.value.title}`,
      description: `Refine stops, collaborators, and sharing settings for ${trip.value.title}.`,
      icon: '✍️',
    },
  })

  useWebPageSchema({
    name: `Edit ${trip.value.title}`,
    description: `Refine stops, collaborators, and sharing settings for ${trip.value.title}.`,
  })
}
else {
  useSeo({
    title: 'Edit trip',
    description: 'Refine stops, collaborators, and sharing settings in DriftMap.',
    ogImage: {
      title: 'Edit trip',
      description: 'Refine stops, collaborators, and sharing settings in DriftMap.',
      icon: '✍️',
    },
  })

  useWebPageSchema({
    name: 'Edit trip',
    description: 'Refine stops, collaborators, and sharing settings in DriftMap.',
  })
}

async function runMutation<T>(operation: () => Promise<T>) {
  errorMessage.value = ''
  busy.value = true

  try {
    return await operation()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save changes.'
    return null
  }
  finally {
    busy.value = false
  }
}

async function applyTripUpdate(payload: Partial<TripMutationInput>) {
  const nextTrip = await runMutation(async () => await updateTrip(tripId.value, payload))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyAddDay(payload: TripDayMutationInput) {
  const nextTrip = await runMutation(async () => await addDay(tripId.value, payload))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyUpdateDay(payload: { dayId: string, data: Partial<TripDayMutationInput> }) {
  const nextTrip = await runMutation(async () => await updateDay(tripId.value, payload.dayId, payload.data))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyDeleteDay(payload: { dayId: string }) {
  const nextTrip = await runMutation(async () => await deleteDay(tripId.value, payload.dayId))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyAddStop(payload: { dayId: string, data: StopMutationInput }) {
  const nextTrip = await runMutation(async () => await addStop(tripId.value, payload.dayId, payload.data))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyUpdateStop(payload: { dayId: string, stopId: string, data: Partial<StopMutationInput> }) {
  const nextTrip = await runMutation(async () => await updateStop(tripId.value, payload.dayId, payload.stopId, payload.data))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyDeleteStop(payload: { dayId: string, stopId: string }) {
  const nextTrip = await runMutation(async () => await deleteStop(tripId.value, payload.dayId, payload.stopId))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function applyInvite(payload: { email: string, role: CollaboratorRole }) {
  const nextTrip = await runMutation(async () => await inviteCollaborator(tripId.value, payload.email, payload.role))
  if (nextTrip) {
    trip.value = nextTrip
  }
}

async function removeTrip() {
  const result = await runMutation(async () => await deleteTrip(tripId.value))
  if (result) {
    await navigateTo('/trips')
  }
}
</script>

<template>
  <div class="space-y-8">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Unable to load this editor"
      :description="error.message"
    />

    <template v-else-if="trip">
      <section class="rounded-[2.25rem] border border-default/70 bg-default/70 p-6 shadow-card sm:p-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Editing workspace
            </p>
            <h1 class="mt-3 font-display text-4xl font-semibold text-highlighted sm:text-5xl">
              {{ trip.title }}
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-8 text-toned">
              Refine structure, polish the public share experience, and keep collaborators aligned without losing the visual feel of the trip.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton :to="`/trips/${trip.id}`" color="neutral" variant="outline" icon="i-lucide-eye">
              Preview
            </UButton>
            <UButton color="neutral" variant="ghost" icon="i-lucide-trash-2" :loading="busy" @click="removeTrip">
              Delete
            </UButton>
          </div>
        </div>
      </section>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        title="Unable to save"
        :description="errorMessage"
      />

      <TripEditor
        :trip="trip"
        :busy="busy"
        @update-trip="applyTripUpdate"
        @add-day="applyAddDay"
        @update-day="applyUpdateDay"
        @delete-day="applyDeleteDay"
        @add-stop="applyAddStop"
        @update-stop="applyUpdateStop"
        @delete-stop="applyDeleteStop"
        @invite-collaborator="applyInvite"
      />
    </template>
  </div>
</template>
