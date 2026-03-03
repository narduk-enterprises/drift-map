<script setup lang="ts">
import type {
  CollaboratorRole,
  StopItem,
  StopMutationInput,
  TripDayItem,
  TripDayMutationInput,
  TripDetail,
  TripEditorDayDraft,
  TripEditorStopDraft,
  TripMutationInput,
} from '~/types/drift-map'
import { collaboratorRoles } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  trip: TripDetail
  busy?: boolean
}>(), {
  busy: false,
})

const emit = defineEmits<{
  'update-trip': [payload: Partial<TripMutationInput>]
  'add-day': [payload: TripDayMutationInput]
  'update-day': [payload: { dayId: string, data: Partial<TripDayMutationInput> }]
  'delete-day': [payload: { dayId: string }]
  'add-stop': [payload: { dayId: string, data: StopMutationInput }]
  'update-stop': [payload: { dayId: string, stopId: string, data: Partial<StopMutationInput> }]
  'delete-stop': [payload: { dayId: string, stopId: string }]
  'invite-collaborator': [payload: { email: string, role: CollaboratorRole }]
}>()

const tripForm = reactive({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  shareSlug: '',
  coverImageKey: null as string | null,
  isPublic: false,
})

const newDayForm = reactive({
  date: '',
  title: '',
  notes: '',
})

const inviteForm = reactive({
  email: '',
  role: 'viewer' as CollaboratorRole,
})

const dayDrafts = ref<Record<string, TripEditorDayDraft>>({})
const stopDrafts = ref<Record<string, TripEditorStopDraft>>({})
const newStopDrafts = ref<Record<string, TripEditorStopDraft>>({})
const draggedDayId = ref<string | null>(null)
const draggedStop = ref<{ dayId: string, stopId: string } | null>(null)

function createEmptyStopDraft(): TripEditorStopDraft {
  return {
    name: '',
    description: '',
    address: '',
    category: 'activity',
    latitude: null,
    longitude: null,
    photoKeys: [],
    url: '',
  }
}

function createStopDraft(stop: StopItem): TripEditorStopDraft {
  return {
    name: stop.name,
    description: stop.description,
    address: stop.address,
    category: stop.category,
    latitude: stop.latitude,
    longitude: stop.longitude,
    photoKeys: [...stop.photoKeys],
    url: stop.url ?? '',
  }
}

function createDayDraft(day: TripDayItem): TripEditorDayDraft {
  return {
    date: day.date,
    title: day.title ?? '',
    notes: day.notes,
  }
}

function seedState() {
  tripForm.title = props.trip.title
  tripForm.description = props.trip.description
  tripForm.startDate = props.trip.startDate
  tripForm.endDate = props.trip.endDate
  tripForm.shareSlug = props.trip.shareSlug
  tripForm.coverImageKey = props.trip.coverImageKey
  tripForm.isPublic = props.trip.isPublic

  const nextDayDrafts: Record<string, TripEditorDayDraft> = {}
  const nextStopDrafts: Record<string, TripEditorStopDraft> = {}
  const nextNewStopDrafts: Record<string, TripEditorStopDraft> = {}

  for (const day of props.trip.days) {
    nextDayDrafts[day.id] = createDayDraft(day)
    nextNewStopDrafts[day.id] = createEmptyStopDraft()

    for (const stop of day.stops) {
      nextStopDrafts[stop.id] = createStopDraft(stop)
    }
  }

  dayDrafts.value = nextDayDrafts
  stopDrafts.value = nextStopDrafts
  newStopDrafts.value = nextNewStopDrafts

  if (!newDayForm.date) {
    newDayForm.date = props.trip.endDate
  }
}

watch(() => props.trip, seedState, { immediate: true })

function getSelectionClass(active: boolean) {
  return active ? 'bg-primary text-inverted shadow-card' : 'bg-default text-toned'
}

function getCurrentDayIndex(dayId: string) {
  return props.trip.days.findIndex((day) => day.id === dayId)
}

function getCurrentStopIndex(day: TripDayItem, stopId: string) {
  return day.stops.findIndex((stop) => stop.id === stopId)
}

function saveTrip() {
  emit('update-trip', {
    title: tripForm.title,
    description: tripForm.description,
    startDate: tripForm.startDate,
    endDate: tripForm.endDate,
    shareSlug: tripForm.shareSlug,
    coverImageKey: tripForm.coverImageKey,
    isPublic: tripForm.isPublic,
  })
}

function setTripVisibility(isPublic: boolean) {
  tripForm.isPublic = isPublic
}

function submitNewDay() {
  if (!newDayForm.date) {
    return
  }

  emit('add-day', {
    date: newDayForm.date,
    title: newDayForm.title?.trim() || null,
    notes: newDayForm.notes || '',
  })

  newDayForm.title = ''
  newDayForm.notes = ''
}

function saveDay(dayId: string) {
  const draft = dayDrafts.value[dayId]
  if (!draft) {
    return
  }

  emit('update-day', {
    dayId,
    data: {
      date: draft.date,
      title: draft.title.trim() || null,
      notes: draft.notes,
    },
  })
}

function moveDay(dayId: string, direction: -1 | 1) {
  const currentIndex = getCurrentDayIndex(dayId)
  const nextIndex = currentIndex + direction

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= props.trip.days.length) {
    return
  }

  emit('update-day', {
    dayId,
    data: {
      dayNumber: nextIndex + 1,
    },
  })
}

function startDayDrag(dayId: string) {
  draggedDayId.value = dayId
}

function handleDayDrop(targetDayId: string) {
  if (!draggedDayId.value || draggedDayId.value === targetDayId) {
    draggedDayId.value = null
    return
  }

  const targetIndex = getCurrentDayIndex(targetDayId)
  if (targetIndex >= 0) {
    emit('update-day', {
      dayId: draggedDayId.value,
      data: {
        dayNumber: targetIndex + 1,
      },
    })
  }

  draggedDayId.value = null
}

function updateStopPhotoKeys(stopId: string, nextKeys: string[]) {
  const draft = stopDrafts.value[stopId]
  if (draft) {
    draft.photoKeys = nextKeys
  }
}

function updateNewStopPhotoKeys(dayId: string, nextKeys: string[]) {
  const draft = newStopDrafts.value[dayId]
  if (draft) {
    draft.photoKeys = nextKeys
  }
}

function saveStop(dayId: string, stopId: string) {
  const draft = stopDrafts.value[stopId]
  if (!draft) {
    return
  }

  emit('update-stop', {
    dayId,
    stopId,
    data: {
      name: draft.name,
      description: draft.description,
      address: draft.address,
      category: draft.category,
      latitude: draft.latitude,
      longitude: draft.longitude,
      photoKeys: draft.photoKeys,
      url: draft.url.trim() || null,
    },
  })
}

function moveStop(day: TripDayItem, stopId: string, direction: -1 | 1) {
  const currentIndex = getCurrentStopIndex(day, stopId)
  const nextIndex = currentIndex + direction

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= day.stops.length) {
    return
  }

  emit('update-stop', {
    dayId: day.id,
    stopId,
    data: {
      sortOrder: nextIndex + 1,
    },
  })
}

function startStopDrag(dayId: string, stopId: string) {
  draggedStop.value = { dayId, stopId }
}

function handleStopDrop(day: TripDayItem, targetStopId: string) {
  if (!draggedStop.value || draggedStop.value.stopId === targetStopId || draggedStop.value.dayId !== day.id) {
    draggedStop.value = null
    return
  }

  const targetIndex = getCurrentStopIndex(day, targetStopId)
  if (targetIndex >= 0) {
    emit('update-stop', {
      dayId: day.id,
      stopId: draggedStop.value.stopId,
      data: {
        sortOrder: targetIndex + 1,
      },
    })
  }

  draggedStop.value = null
}

function submitNewStop(dayId: string) {
  const draft = newStopDrafts.value[dayId]
  if (!draft || !draft.name.trim()) {
    return
  }

  emit('add-stop', {
    dayId,
    data: {
      name: draft.name,
      description: draft.description,
      address: draft.address,
      category: draft.category,
      latitude: draft.latitude,
      longitude: draft.longitude,
      photoKeys: draft.photoKeys,
      url: draft.url.trim() || null,
    },
  })

  newStopDrafts.value[dayId] = createEmptyStopDraft()
}

function moveDayUp(dayId: string) {
  moveDay(dayId, -1)
}

function moveDayDown(dayId: string) {
  moveDay(dayId, 1)
}

function removeDay(dayId: string) {
  emit('delete-day', { dayId })
}

function handleDayDropEvent(dayId: string) {
  handleDayDrop(dayId)
}

function handleStopDragEvent(payload: { dayId: string, stopId: string }) {
  startStopDrag(payload.dayId, payload.stopId)
}

function handleStopDropEvent(payload: { dayId: string, stopId: string }) {
  const day = props.trip.days.find((entry) => entry.id === payload.dayId)
  if (day) {
    handleStopDrop(day, payload.stopId)
  }
}

function moveStopUp(payload: { dayId: string, stopId: string }) {
  const day = props.trip.days.find((entry) => entry.id === payload.dayId)
  if (day) {
    moveStop(day, payload.stopId, -1)
  }
}

function moveStopDown(payload: { dayId: string, stopId: string }) {
  const day = props.trip.days.find((entry) => entry.id === payload.dayId)
  if (day) {
    moveStop(day, payload.stopId, 1)
  }
}

function saveStopFromCard(payload: { dayId: string, stopId: string }) {
  saveStop(payload.dayId, payload.stopId)
}

function removeStopFromCard(payload: { dayId: string, stopId: string }) {
  emit('delete-stop', payload)
}

function handleStopPhotoKeysEvent(payload: { dayId: string, stopId: string, nextKeys: string[] }) {
  updateStopPhotoKeys(payload.stopId, payload.nextKeys)
}

function addStopFromCard(dayId: string) {
  submitNewStop(dayId)
}

function handleNewStopPhotoKeysEvent(payload: { dayId: string, nextKeys: string[] }) {
  updateNewStopPhotoKeys(payload.dayId, payload.nextKeys)
}

function setInviteRole(role: CollaboratorRole) {
  inviteForm.role = role
}

function submitInvite() {
  if (!inviteForm.email.trim()) {
    return
  }

  emit('invite-collaborator', {
    email: inviteForm.email,
    role: inviteForm.role,
  })

  inviteForm.email = ''
}
</script>

<template>
  <div class="space-y-8">
    <UCard class="glass-card p-6 sm:p-8">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Trip title">
              <UInput v-model="tripForm.title" class="w-full" />
            </UFormField>
            <UFormField label="Share slug">
              <UInput v-model="tripForm.shareSlug" class="w-full" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Start date">
              <UInput v-model="tripForm.startDate" type="date" class="w-full" />
            </UFormField>
            <UFormField label="End date">
              <UInput v-model="tripForm.endDate" type="date" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Trip summary">
            <UTextarea v-model="tripForm.description" :rows="4" class="w-full" />
          </UFormField>
        </div>

        <div class="space-y-5">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Visibility
            </p>
            <div class="flex gap-2">
              <UButton
                color="neutral"
                :class="getSelectionClass(!tripForm.isPublic)"
                @click="setTripVisibility(false)"
              >
                Private
              </UButton>
              <UButton
                color="neutral"
                :class="getSelectionClass(tripForm.isPublic)"
                @click="setTripVisibility(true)"
              >
                Public
              </UButton>
            </div>
          </div>

          <PhotoUploader
            :model-value="tripForm.coverImageKey ? [tripForm.coverImageKey] : []"
            label="Cover photo"
            @update:model-value="(nextKeys) => { tripForm.coverImageKey = nextKeys[0] || null }"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <UButton color="primary" icon="i-lucide-save" :loading="props.busy" @click="saveTrip">
          Save trip details
        </UButton>
      </div>
    </UCard>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div class="space-y-8">
        <UCard class="card-base p-6">
          <div class="flex flex-col gap-5">
            <div>
              <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
                Add a day
              </p>
              <h2 class="mt-2 font-display text-3xl font-semibold text-highlighted">
                Expand the itinerary
              </h2>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField label="Date">
                <UInput v-model="newDayForm.date" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Label">
                <UInput v-model="newDayForm.title" class="w-full" placeholder="Arrival day" />
              </UFormField>
            </div>

            <UFormField label="Notes">
              <UTextarea v-model="newDayForm.notes" :rows="3" class="w-full" />
            </UFormField>

            <div class="flex justify-end">
              <UButton color="primary" icon="i-lucide-calendar-plus" :loading="props.busy" @click="submitNewDay">
                Add day
              </UButton>
            </div>
          </div>
        </UCard>

        <div class="space-y-6">
          <TripEditorDayCard
            v-for="day in props.trip.days"
            :key="day.id"
            :day="day"
            v-model:draft="dayDrafts[day.id]!"
            :stop-drafts="stopDrafts"
            v-model:new-stop-draft="newStopDrafts[day.id]!"
            :busy="props.busy"
            @move-up="moveDayUp"
            @move-down="moveDayDown"
            @save-day="saveDay"
            @delete-day="removeDay"
            @day-drag-start="startDayDrag"
            @day-drop="handleDayDropEvent"
            @stop-drag-start="handleStopDragEvent"
            @stop-drop="handleStopDropEvent"
            @move-stop-up="moveStopUp"
            @move-stop-down="moveStopDown"
            @save-stop="saveStopFromCard"
            @delete-stop="removeStopFromCard"
            @update-stop-photo-keys="handleStopPhotoKeysEvent"
            @add-stop="addStopFromCard"
            @update-new-stop-photo-keys="handleNewStopPhotoKeysEvent"
          />
        </div>
      </div>

      <div class="space-y-6">
        <UCard class="glass-card p-6">
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Collaborators
            </p>
            <h2 class="font-display text-2xl font-semibold text-highlighted">
              Invite editors
            </h2>

            <div class="space-y-3">
              <div
                v-for="collaborator in props.trip.collaborators"
                :key="collaborator.id"
                class="rounded-3xl border border-default/70 bg-default/70 px-4 py-4"
              >
                <p class="font-medium text-highlighted">
                  {{ collaborator.email }}
                </p>
                <p class="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                  {{ collaborator.role }}
                </p>
              </div>
            </div>

            <UFormField label="Email">
              <UInput v-model="inviteForm.email" type="email" class="w-full" placeholder="teammate@example.com" />
            </UFormField>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="role in collaboratorRoles"
                :key="role"
                color="neutral"
                size="sm"
                :class="getSelectionClass(inviteForm.role === role)"
                @click="setInviteRole(role)"
              >
                {{ role }}
              </UButton>
            </div>

            <UButton color="primary" icon="i-lucide-send" :loading="props.busy" @click="submitInvite">
              Send invite
            </UButton>
          </div>
        </UCard>

        <UCard class="card-base p-6">
          <div class="space-y-3">
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Editing notes
            </p>
            <p class="text-sm leading-7 text-toned">
              Drag cards to reorder days and stops, then save. Public trips expose a read-only share page while keeping editing locked to this workspace.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
