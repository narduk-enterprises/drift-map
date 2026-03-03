<script setup lang="ts">
import type {
  TripDayItem,
  TripEditorDayDraft,
  TripEditorStopDraft,
} from '~/types/drift-map'

const props = withDefaults(defineProps<{
  day: TripDayItem
  stopDrafts: Record<string, TripEditorStopDraft>
  busy?: boolean
}>(), {
  busy: false,
})

const draft = defineModel<TripEditorDayDraft>('draft', { required: true })
const newStopDraft = defineModel<TripEditorStopDraft>('newStopDraft', { required: true })

const emit = defineEmits<{
  'move-up': [dayId: string]
  'move-down': [dayId: string]
  'save-day': [dayId: string]
  'delete-day': [dayId: string]
  'day-drag-start': [dayId: string]
  'day-drop': [dayId: string]
  'stop-drag-start': [payload: { dayId: string, stopId: string }]
  'stop-drop': [payload: { dayId: string, stopId: string }]
  'move-stop-up': [payload: { dayId: string, stopId: string }]
  'move-stop-down': [payload: { dayId: string, stopId: string }]
  'save-stop': [payload: { dayId: string, stopId: string }]
  'delete-stop': [payload: { dayId: string, stopId: string }]
  'update-stop-photo-keys': [payload: { dayId: string, stopId: string, nextKeys: string[] }]
  'add-stop': [dayId: string]
  'update-new-stop-photo-keys': [payload: { dayId: string, nextKeys: string[] }]
}>()

function moveUp() {
  emit('move-up', props.day.id)
}

function moveDown() {
  emit('move-down', props.day.id)
}

function saveDay() {
  emit('save-day', props.day.id)
}

function deleteDay() {
  emit('delete-day', props.day.id)
}

function startDayDrag() {
  emit('day-drag-start', props.day.id)
}

function dropDay() {
  emit('day-drop', props.day.id)
}

function handleStopDragStart(stopId: string) {
  emit('stop-drag-start', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopDrop(stopId: string) {
  emit('stop-drop', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopMoveUp(stopId: string) {
  emit('move-stop-up', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopMoveDown(stopId: string) {
  emit('move-stop-down', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopSave(stopId: string) {
  emit('save-stop', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopDelete(stopId: string) {
  emit('delete-stop', {
    dayId: props.day.id,
    stopId,
  })
}

function handleStopPhotoUpdate(payload: { stopId: string, nextKeys: string[] }) {
  emit('update-stop-photo-keys', {
    dayId: props.day.id,
    stopId: payload.stopId,
    nextKeys: payload.nextKeys,
  })
}

function addStop() {
  emit('add-stop', props.day.id)
}

function handleNewStopPhotoUpdate(payload: { dayId: string, nextKeys: string[] }) {
  emit('update-new-stop-photo-keys', payload)
}
</script>

<template>
  <article
    draggable="true"
    class="card-base p-6"
    @dragstart="startDayDrag"
    @dragover.prevent
    @drop="dropDay"
  >
    <div class="space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <span class="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <UIcon name="i-lucide-grip-vertical" class="size-5" />
          </span>
          <div>
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Day {{ props.day.dayNumber }}
            </p>
            <h3 class="font-display text-2xl font-semibold text-highlighted">
              {{ props.day.title || `Itinerary day ${props.day.dayNumber}` }}
            </h3>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton color="neutral" variant="outline" icon="i-lucide-arrow-up" :disabled="props.busy" @click="moveUp">
            Up
          </UButton>
          <UButton color="neutral" variant="outline" icon="i-lucide-arrow-down" :disabled="props.busy" @click="moveDown">
            Down
          </UButton>
          <UButton color="primary" icon="i-lucide-save" :loading="props.busy" @click="saveDay">
            Save
          </UButton>
          <UButton color="neutral" variant="ghost" icon="i-lucide-trash-2" :disabled="props.busy" @click="deleteDay" />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Date">
          <UInput v-model="draft.date" type="date" class="w-full" />
        </UFormField>
        <UFormField label="Title">
          <UInput v-model="draft.title" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="Notes">
        <UTextarea v-model="draft.notes" :rows="3" class="w-full" />
      </UFormField>

      <USeparator />

      <div class="space-y-5">
        <div class="flex items-center justify-between gap-3">
          <h4 class="font-display text-xl font-semibold text-highlighted">
            Stops
          </h4>
          <UBadge variant="soft" color="neutral">
            {{ props.day.stops.length }} items
          </UBadge>
        </div>

        <div v-if="props.day.stops.length" class="space-y-5">
          <TripEditorStopCard
            v-for="stop in props.day.stops"
            :key="stop.id"
            :stop="stop"
            v-model:draft="props.stopDrafts[stop.id]!"
            :busy="props.busy"
            @drag-start="handleStopDragStart"
            @drop="handleStopDrop"
            @move-up="handleStopMoveUp"
            @move-down="handleStopMoveDown"
            @save="handleStopSave"
            @remove="handleStopDelete"
            @update-photo-keys="handleStopPhotoUpdate"
          />
        </div>

        <TripEditorNewStopCard
          :day-id="props.day.id"
          :day-number="props.day.dayNumber"
          v-model:draft="newStopDraft"
          :busy="props.busy"
          @add="addStop"
          @update-photo-keys="handleNewStopPhotoUpdate"
        />
      </div>
    </div>
  </article>
</template>
