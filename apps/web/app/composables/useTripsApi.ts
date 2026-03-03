import type {
  CollaboratorRole,
  StopMutationInput,
  TripDayMutationInput,
  TripDetail,
  TripListResponse,
  TripMutationInput,
} from '~/types/drift-map'

export function useTripsApi() {
  const { $csrfFetch } = useNuxtApp()

  async function listTrips(page = 1, pageSize = 9) {
    return await $fetch<TripListResponse>('/api/trips', {
      query: { page, pageSize },
    })
  }

  async function createTrip(payload: TripMutationInput) {
    return await $csrfFetch<TripDetail>('/api/trips', {
      method: 'POST',
      body: payload,
    })
  }

  async function getTrip(tripId: string) {
    return await $fetch<TripDetail>(`/api/trips/${tripId}`)
  }

  async function updateTrip(tripId: string, payload: Partial<TripMutationInput>) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: payload,
    })
  }

  async function deleteTrip(tripId: string) {
    return await $csrfFetch<{ deleted: boolean, tripId: string }>(`/api/trips/${tripId}`, {
      method: 'DELETE',
    })
  }

  async function addDay(tripId: string, payload: TripDayMutationInput) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days`, {
      method: 'POST',
      body: payload,
    })
  }

  async function updateDay(tripId: string, dayId: string, payload: Partial<TripDayMutationInput>) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days/${dayId}`, {
      method: 'PUT',
      body: payload,
    })
  }

  async function deleteDay(tripId: string, dayId: string) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days/${dayId}`, {
      method: 'DELETE',
    })
  }

  async function addStop(tripId: string, dayId: string, payload: StopMutationInput) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days/${dayId}/stops`, {
      method: 'POST',
      body: payload,
    })
  }

  async function updateStop(tripId: string, dayId: string, stopId: string, payload: Partial<StopMutationInput>) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days/${dayId}/stops/${stopId}`, {
      method: 'PUT',
      body: payload,
    })
  }

  async function deleteStop(tripId: string, dayId: string, stopId: string) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/days/${dayId}/stops/${stopId}`, {
      method: 'DELETE',
    })
  }

  async function inviteCollaborator(tripId: string, email: string, role: CollaboratorRole) {
    return await $csrfFetch<TripDetail>(`/api/trips/${tripId}/collaborators`, {
      method: 'POST',
      body: { email, role },
    })
  }

  async function getSharedTrip(slug: string) {
    return await $fetch<TripDetail>(`/api/trips/${slug}/share`)
  }

  async function uploadPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return await $csrfFetch<{ key: string, url: string | null, contentType: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })
  }

  return {
    listTrips,
    createTrip,
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
    getSharedTrip,
    uploadPhoto,
  }
}
