<script setup lang="ts">
import type { StopItem, TripEditorStopDraft } from '~/types/drift-map'
import { stopCategories } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  stop: StopItem
  busy?: boolean
}>(), {
  busy: false,
})

const draft = defineModel<TripEditorStopDraft>('draft', { required: true })

const emit = defineEmits<{
  'drag-start': [stopId: string]
  drop: [stopId: string]
  'move-up': [stopId: string]
  'move-down': [stopId: string]
  save: [stopId: string]
  remove: [stopId: string]
  'update-photo-keys': [payload: { stopId: string, nextKeys: string[] }]
}>()

function startDrag() {
  emit('drag-start', props.stop.id)
}

function dropOnStop() {
  emit('drop', props.stop.id)
}

function moveUp() {
  emit('move-up', props.stop.id)
}

function moveDown() {
  emit('move-down', props.stop.id)
}

function saveStop() {
  emit('save', props.stop.id)
}

function removeStop() {
  emit('remove', props.stop.id)
}

function selectCategory(category: typeof stopCategories[number]) {
  draft.value.category = category
}

function handlePhotoUpdate(nextKeys: string[]) {
  emit('update-photo-keys', {
    stopId: props.stop.id,
    nextKeys,
  })
}
</script>

<template>
  <div
    draggable="true"
    class="rounded-[1.75rem] border border-default/70 bg-default/70 p-5"
    @dragstart="startDrag"
    @dragover.prevent
    @drop="dropOnStop"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <span class="inline-flex size-9 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <UIcon name="i-lucide-grip" class="size-4.5" />
          </span>
          <div>
            <p class="text-xs font-semibold tracking-[0.24em] uppercase text-muted">
              Stop {{ props.stop.sortOrder }}
            </p>
            <p class="font-semibold text-highlighted">
              {{ props.stop.name }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton color="neutral" variant="outline" icon="i-lucide-arrow-up" size="sm" :disabled="props.busy" @click="moveUp">
            Up
          </UButton>
          <UButton color="neutral" variant="outline" icon="i-lucide-arrow-down" size="sm" :disabled="props.busy" @click="moveDown">
            Down
          </UButton>
          <UButton color="primary" icon="i-lucide-save" size="sm" :loading="props.busy" @click="saveStop">
            Save
          </UButton>
          <UButton color="neutral" variant="ghost" icon="i-lucide-trash-2" size="sm" :disabled="props.busy" @click="removeStop" />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Name">
          <UInput v-model="draft.name" class="w-full" />
        </UFormField>
        <UFormField label="Address">
          <UInput v-model="draft.address" class="w-full" />
        </UFormField>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="category in stopCategories"
          :key="category"
          color="neutral"
          size="xs"
          :class="draft.category === category ? 'bg-primary text-inverted shadow-card' : 'bg-default text-toned'"
          @click="selectCategory(category)"
        >
          {{ category }}
        </UButton>
      </div>

      <UFormField label="Description">
        <UTextarea v-model="draft.description" :rows="3" class="w-full" />
      </UFormField>

      <UFormField label="External link">
        <UInput v-model="draft.url" class="w-full" placeholder="https://example.com" />
      </UFormField>

      <PhotoUploader
        :model-value="draft.photoKeys"
        label="Stop photos"
        @update:model-value="handlePhotoUpdate"
      />
    </div>
  </div>
</template>
