export const stopCategories = ['food', 'lodging', 'activity', 'transport', 'sightseeing'] as const
export type StopCategory = typeof stopCategories[number]

export const collaboratorRoles = ['owner', 'editor', 'viewer'] as const
export type CollaboratorRole = typeof collaboratorRoles[number]

export interface TripSummary {
  id: string
  title: string
  description: string
  coverImageKey: string | null
  coverImageUrl: string | null
  startDate: string
  endDate: string
  shareSlug: string
  shareUrl: string
  isPublic: boolean
  dayCount: number
  stopCount: number
  updatedAt: string
}

export interface StopItem {
  id: string
  name: string
  description: string
  latitude: number | null
  longitude: number | null
  address: string
  category: StopCategory
  sortOrder: number
  photoKeys: string[]
  photoUrls: string[]
  url: string | null
  createdAt: string
}

export interface TripDayItem {
  id: string
  dayNumber: number
  date: string
  title: string | null
  notes: string
  stops: StopItem[]
}

export interface CollaboratorItem {
  id: string
  email: string
  role: CollaboratorRole
  inviteToken: string
  inviteUrl: string
  acceptedAt: string | null
  createdAt: string
}

export interface TripDetail extends TripSummary {
  days: TripDayItem[]
  collaborators: CollaboratorItem[]
}

export interface TripListResponse {
  items: TripSummary[]
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
}

export interface TripMutationInput {
  title: string
  description: string
  startDate: string
  endDate: string
  coverImageKey?: string | null
  isPublic?: boolean
  shareSlug?: string
}

export interface TripDayMutationInput {
  date: string
  title?: string | null
  notes?: string
  dayNumber?: number
}

export interface StopMutationInput {
  name: string
  description?: string
  latitude?: number | null
  longitude?: number | null
  address?: string
  category?: StopCategory
  sortOrder?: number
  photoKeys?: string[]
  url?: string | null
}

export interface TripEditorDayDraft {
  date: string
  title: string
  notes: string
}

export interface TripEditorStopDraft {
  name: string
  description: string
  address: string
  category: StopCategory
  latitude: number | null
  longitude: number | null
  photoKeys: string[]
  url: string
}
