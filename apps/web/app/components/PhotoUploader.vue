<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  label?: string
  disabled?: boolean
}>(), {
  label: 'Photos',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [keys: string[]]
  error: [message: string]
}>()

const { uploadPhoto } = useTripsApi()
const uploading = ref(false)

function getAssetUrl(key: string) {
  return `/api/assets/${key.split('/').map(encodeURIComponent).join('/')}`
}

async function handleChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = input?.files ? Array.from(input.files) : []

  if (!files.length) {
    return
  }

  uploading.value = true

  try {
    const nextKeys = [...props.modelValue]

    for (const file of files) {
      const result = await uploadPhoto(file)
      if (!nextKeys.includes(result.key)) {
        nextKeys.push(result.key)
      }
    }

    emit('update:modelValue', nextKeys)
  }
  catch (error) {
    emit('error', error instanceof Error ? error.message : 'Upload failed.')
  }
  finally {
    uploading.value = false

    if (input) {
      input.value = ''
    }
  }
}

function removeKey(key: string) {
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== key))
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm font-semibold text-highlighted">
        {{ props.label }}
      </p>
      <UBadge variant="soft" color="neutral">
        {{ props.modelValue.length }} uploaded
      </UBadge>
    </div>

    <UInput
      type="file"
      accept="image/*"
      multiple
      class="w-full"
      :disabled="props.disabled || uploading"
      @change="handleChange"
    />

    <div v-if="uploading" class="rounded-3xl bg-default px-4 py-3 text-sm text-toned">
      Uploading images...
    </div>

    <div v-if="props.modelValue.length" class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="key in props.modelValue"
        :key="key"
        class="overflow-hidden rounded-3xl border border-default/70 bg-default"
      >
        <img :src="getAssetUrl(key)" :alt="key" class="h-32 w-full object-cover">
        <div class="flex items-center justify-between gap-3 px-3 py-3">
          <p class="truncate text-xs text-muted">
            {{ key.split('/').at(-1) }}
          </p>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" aria-label="Remove photo" @click="removeKey(key)" />
        </div>
      </div>
    </div>
  </div>
</template>
