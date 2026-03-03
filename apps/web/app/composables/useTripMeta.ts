import type { StopCategory } from '~/types/drift-map'

const categoryMap: Record<StopCategory, { label: string, icon: string }> = {
  activity: { label: 'Activity', icon: 'i-lucide-sparkles' },
  food: { label: 'Food', icon: 'i-lucide-utensils-crossed' },
  lodging: { label: 'Stay', icon: 'i-lucide-bed-double' },
  sightseeing: { label: 'Sight', icon: 'i-lucide-camera' },
  transport: { label: 'Transit', icon: 'i-lucide-train-front' },
}

export function useTripMeta() {
  function formatTripRange(startDate: string, endDate: string) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    })

    return `${formatter.format(new Date(`${startDate}T00:00:00`))} to ${formatter.format(new Date(`${endDate}T00:00:00`))}`
  }

  function formatFullDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`))
  }

  function getCategoryMeta(category: StopCategory): { label: string, icon: string } {
    return categoryMap[category]
  }

  return {
    formatTripRange,
    formatFullDate,
    getCategoryMeta,
  }
}
