<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const appName = useRuntimeConfig().public.appName

const navItems = [
  { label: 'Home', to: '/', icon: 'i-lucide-compass' },
  { label: 'Trips', to: '/trips', icon: 'i-lucide-map' },
  { label: 'New Trip', to: '/trips/new', icon: 'i-lucide-route' },
]

const colorModeIcon = computed(() => {
  if (colorMode.preference === 'system') {
    return 'i-lucide-monitor'
  }

  return colorMode.value === 'dark' ? 'i-lucide-moon-star' : 'i-lucide-sun-medium'
})

function cycleColorMode() {
  const modes = ['system', 'light', 'dark'] as const
  const currentIndex = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(currentIndex + 1) % modes.length]!
}
</script>

<template>
  <UApp>
    <ULink to="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-inverted">
      Skip to content
    </ULink>

    <div class="travel-shell route-grid min-h-screen">
      <div class="sticky top-0 z-50 border-b border-default/70 bg-default/80 backdrop-blur-xl">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NuxtLink to="/" class="group inline-flex items-center gap-3">
            <span class="inline-flex size-11 items-center justify-center rounded-3xl bg-primary text-inverted shadow-card transition-base group-hover:-translate-y-0.5">
              <UIcon name="i-lucide-compass" class="size-5" />
            </span>
            <span>
              <span class="block font-display text-xl font-semibold text-highlighted">{{ appName }}</span>
              <span class="block text-xs tracking-[0.22em] text-muted uppercase">Shared travel journals</span>
            </span>
          </NuxtLink>

          <div class="hidden items-center gap-2 md:flex" role="navigation" aria-label="Primary">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-base"
              :class="route.path === item.to ? 'bg-primary text-inverted shadow-card' : 'text-toned hover:bg-default hover:text-highlighted'"
            >
              <UIcon :name="item.icon" class="size-4" />
              {{ item.label }}
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2">
            <UButton to="/trips/new" color="primary" icon="i-lucide-plus" class="hidden sm:inline-flex">
              Start a trip
            </UButton>
            <UButton :icon="colorModeIcon" color="neutral" variant="ghost" aria-label="Toggle color mode" @click="cycleColorMode" />
          </div>
        </div>

        <div class="border-t border-default/60 px-4 py-3 md:hidden">
          <div class="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-base"
              :class="route.path === item.to ? 'bg-primary text-inverted shadow-card' : 'glass text-toned'"
            >
              <UIcon :name="item.icon" class="size-4" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div id="main-content" class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8" role="main">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>

      <div class="border-t border-default/70 py-8" role="contentinfo">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-toned sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>DriftMap helps crews turn loose ideas into clear, mobile-friendly itineraries.</p>
          <p class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-globe" class="size-4 text-primary" />
            <span>{{ new Date().getFullYear() }} {{ appName }}</span>
          </p>
        </div>
      </div>
    </div>
  </UApp>
</template>
