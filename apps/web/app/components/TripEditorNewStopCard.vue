<script setup lang="ts">
import type { TripEditorStopDraft } from '~/types/drift-map'
import { stopCategories } from '~/types/drift-map'

const props = withDefaults(defineProps<{
  dayId: string
  dayNumber: number
  busy?: boolean
}>(), {
  busy: false,
})

const draft = defineModel<TripEditorStopDraft>('draft', { required: true })

const emit = defineEmits<{
  add: [dayId: string]
  'update-photo-keys': [payload: { dayId: string, nextKeys: string[] }]
}>()

function selectCategory(category: typeof stopCategories[number]) {
  draft.value.category = category
}

function addStop() {
  emit('add', props.dayId)
}

function handlePhotoUpdate(nextKeys: string[]) {
  emit('update-photo-keys', {
    dayId: props.dayId,
    nextKeys,
  })
}
</script>

<template>
  <div class="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 p-5">
    <div class="space-y-4">
      <p class="font-semibold text-highlighted">
        Add stop to Day {{ props.dayNumber }}
      </p>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Name">
          <UInput v-model="draft.name" class="w-full" placeholder="Cafe, hotel, museum..." />
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

      <div class="flex justify-end">
        <UButton color="primary" icon="i-lucide-plus" :loading="props.busy" @click="addStop">
          Add stop
        </UButton>
      </div>
    </div>
  </div>
</template>
