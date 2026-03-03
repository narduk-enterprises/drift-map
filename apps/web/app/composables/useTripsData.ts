import type { MaybeRefOrGetter } from 'vue'
import type { TripListResponse } from '~/types/drift-map'

export function useTripsDashboardData(page: MaybeRefOrGetter<number>) {
  const currentPage = computed(() => toValue(page))

  return useFetch<TripListResponse>('/api/trips', {
    key: computed(() => `trips-dashboard-${currentPage.value}`),
    query: computed(() => ({
      page: currentPage.value,
      pageSize: 9,
    })),
    default: () => ({
      items: [],
      pagination: {
        page: 1,
        pageSize: 9,
        total: 0,
        pageCount: 0,
      },
    }),
  })
}

export function useTripDetailData(tripId: MaybeRefOrGetter<string>) {
  const currentTripId = computed(() => toValue(tripId))
  const { getTrip } = useTripsApi()

  return useAsyncData(
    () => `trip-detail-${currentTripId.value}`,
    async () => await getTrip(currentTripId.value),
  )
}

export function useSharedTripData(slug: MaybeRefOrGetter<string>) {
  const currentSlug = computed(() => toValue(slug))
  const { getSharedTrip } = useTripsApi()

  return useAsyncData(
    () => `shared-trip-${currentSlug.value}`,
    async () => await getSharedTrip(currentSlug.value),
  )
}
