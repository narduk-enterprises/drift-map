import type { H3Event } from 'h3'
import type { CollaboratorRole, StopCategory } from '@drift-map/db'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { collaborators, stopCategories, stops, tripDays, trips } from '#server/database/schema'
import { deleteFromR2, uploadToR2 } from '#layer/server/utils/r2'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { useAppDatabase } from '#server/utils/database'

const viewerCookieName = 'driftmap_viewer'

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9),
})

export const tripCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).default(''),
  startDate: z.string().date(),
  endDate: z.string().date(),
  coverImageKey: z.string().trim().max(255).optional().nullable(),
  isPublic: z.boolean().optional().default(false),
})

export const tripUpdateSchema = tripCreateSchema
  .extend({
    shareSlug: z.string().trim().min(3).max(160).optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one trip field to update.',
  })

export const tripDayCreateSchema = z.object({
  date: z.string().date(),
  title: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(4000).optional().default(''),
  dayNumber: z.coerce.number().int().min(1).optional(),
})

export const tripDayUpdateSchema = z.object({
  date: z.string().date().optional(),
  title: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(4000).optional(),
  dayNumber: z.coerce.number().int().min(1).optional(),
})
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one day field to update.',
  })

export const stopCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().default(''),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  address: z.string().trim().max(240).optional().default(''),
  category: z.enum(stopCategories).optional().default('activity'),
  sortOrder: z.coerce.number().int().min(1).optional(),
  photoKeys: z.array(z.string().trim().min(1).max(255)).max(8).optional().default([]),
  url: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
})

export const stopUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  address: z.string().trim().max(240).optional(),
  category: z.enum(stopCategories).optional(),
  sortOrder: z.coerce.number().int().min(1).optional(),
  photoKeys: z.array(z.string().trim().min(1).max(255)).max(8).optional(),
  url: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
})
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one stop field to update.',
  })

const collaboratorRoleSchema = z.enum(['owner', 'editor', 'viewer'] satisfies CollaboratorRole[])

export const collaboratorCreateSchema = z.object({
  email: z.string().trim().email(),
  role: collaboratorRoleSchema.optional().default('viewer'),
})

export interface TripListItem {
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

export interface StopPayload {
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

export interface DayPayload {
  id: string
  dayNumber: number
  date: string
  title: string | null
  notes: string
  stops: StopPayload[]
}

export interface CollaboratorPayload {
  id: string
  email: string
  role: CollaboratorRole
  inviteToken: string
  inviteUrl: string
  acceptedAt: string | null
  createdAt: string
}

export interface TripPayload extends Omit<TripListItem, 'dayCount' | 'stopCount'> {
  dayCount: number
  stopCount: number
  days: DayPayload[]
  collaborators: CollaboratorPayload[]
}

function getBaseUrl(event: H3Event): string {
  const configuredUrl = useRuntimeConfig(event).public.appUrl
  if (configuredUrl) {
    return configuredUrl
  }

  const host = getRequestHeader(event, 'host')
  const protocol = getRequestHeader(event, 'x-forwarded-proto') || 'https'
  return host ? `${protocol}://${host}` : ''
}

function getAssetUrl(key: string | null): string | null {
  if (!key) {
    return null
  }

  return `/api/assets/${key.split('/').map(encodeURIComponent).join('/')}`
}

function parsePhotoKeys(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    }
  }
  catch {
    return []
  }

  return []
}

function normalizeOptionalText(value?: string | null): string | null {
  if (value == null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function serializeStop(stop: typeof stops.$inferSelect): StopPayload {
  const photoKeys = parsePhotoKeys(stop.photoKeys)

  return {
    id: stop.id,
    name: stop.name,
    description: stop.description,
    latitude: stop.latitude ?? null,
    longitude: stop.longitude ?? null,
    address: stop.address,
    category: stop.category,
    sortOrder: stop.sortOrder,
    photoKeys,
    photoUrls: photoKeys.map((key) => getAssetUrl(key)).filter((value): value is string => Boolean(value)),
    url: stop.url ?? null,
    createdAt: stop.createdAt,
  }
}

function serializeTrip(
  event: H3Event,
  trip: typeof trips.$inferSelect,
  days: DayPayload[],
  collaboratorsList: CollaboratorPayload[],
): TripPayload {
  const stopCount = days.reduce((total, day) => total + day.stops.length, 0)
  const baseUrl = getBaseUrl(event)
  const shareUrl = baseUrl ? `${baseUrl}/share/${trip.shareSlug}` : `/share/${trip.shareSlug}`

  return {
    id: trip.id,
    title: trip.title,
    description: trip.description,
    coverImageKey: trip.coverImageKey ?? null,
    coverImageUrl: getAssetUrl(trip.coverImageKey ?? null),
    startDate: trip.startDate,
    endDate: trip.endDate,
    shareSlug: trip.shareSlug,
    shareUrl,
    isPublic: trip.isPublic,
    dayCount: days.length,
    stopCount,
    updatedAt: trip.updatedAt,
    days,
    collaborators: collaboratorsList,
  }
}

function toTripListItem(event: H3Event, trip: typeof trips.$inferSelect, dayCount: number, stopCount: number): TripListItem {
  const baseUrl = getBaseUrl(event)
  const shareUrl = baseUrl ? `${baseUrl}/share/${trip.shareSlug}` : `/share/${trip.shareSlug}`

  return {
    id: trip.id,
    title: trip.title,
    description: trip.description,
    coverImageKey: trip.coverImageKey ?? null,
    coverImageUrl: getAssetUrl(trip.coverImageKey ?? null),
    startDate: trip.startDate,
    endDate: trip.endDate,
    shareSlug: trip.shareSlug,
    shareUrl,
    isPublic: trip.isPublic,
    dayCount,
    stopCount,
    updatedAt: trip.updatedAt,
  }
}

function normalizeDateRange(startDate: string, endDate: string) {
  if (endDate < startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'End date must be on or after the start date.',
    })
  }
}

function normalizeShareSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Share slug must contain letters or numbers.',
    })
  }

  return slug
}

function getRequiredViewerId(event: H3Event): string {
  return getViewerId(event)
}

function createShareSlug(title: string) {
  const base = normalizeShareSlug(title).slice(0, 48)
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}

function createViewerId() {
  return `viewer_${crypto.randomUUID()}`
}

export function getViewerId(event: H3Event, createIfMissing?: true): string
export function getViewerId(event: H3Event, createIfMissing: false): string | null
export function getViewerId(event: H3Event, createIfMissing = true): string | null {
  const currentViewerId = getCookie(event, viewerCookieName)
  if (currentViewerId) {
    return currentViewerId
  }

  if (!createIfMissing) {
    return null
  }

  const nextViewerId = createViewerId()
  setCookie(event, viewerCookieName, nextViewerId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return nextViewerId
}

export async function readBodyWithSchema<TSchema extends z.ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  try {
    return await readValidatedBody(event, (value) => {
      const parsed = schema.safeParse(value ?? {})

      if (!parsed.success) {
        throw parsed.error
      }

      return parsed.data
    })
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request validation failed.',
        data: error.flatten(),
      })
    }

    throw error
  }
}

function readQueryWithSchema<TSchema extends z.ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): z.infer<TSchema> {
  const parsed = schema.safeParse(getQuery(event))

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query validation failed.',
      data: parsed.error.flatten(),
    })
  }

  return parsed.data
}

async function getOwnedTripOrThrow(event: H3Event, tripId: string) {
  const viewerId = getRequiredViewerId(event)
  const db = useAppDatabase(event)

  const trip = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, viewerId)))
    .get()

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Trip not found.',
    })
  }

  return trip
}

async function getDayOrThrow(event: H3Event, tripId: string, dayId: string) {
  const db = useAppDatabase(event)

  const day = await db
    .select()
    .from(tripDays)
    .where(and(eq(tripDays.id, dayId), eq(tripDays.tripId, tripId)))
    .get()

  if (!day) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Trip day not found.',
    })
  }

  return day
}

async function getStopOrThrow(event: H3Event, dayId: string, stopId: string) {
  const db = useAppDatabase(event)

  const stop = await db
    .select()
    .from(stops)
    .where(and(eq(stops.id, stopId), eq(stops.dayId, dayId)))
    .get()

  if (!stop) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Stop not found.',
    })
  }

  return stop
}

async function buildDaysPayload(event: H3Event, tripId: string): Promise<DayPayload[]> {
  const db = useAppDatabase(event)
  const dayRows = await db
    .select()
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(asc(tripDays.dayNumber), asc(tripDays.date))
    .all()

  if (!dayRows.length) {
    return []
  }

  const stopRows = await db
    .select()
    .from(stops)
    .where(inArray(stops.dayId, dayRows.map((day) => day.id)))
    .orderBy(asc(stops.sortOrder), asc(stops.createdAt))
    .all()

  const stopsByDayId = new Map<string, StopPayload[]>()
  for (const stop of stopRows) {
    const dayStops = stopsByDayId.get(stop.dayId) || []
    dayStops.push(serializeStop(stop))
    stopsByDayId.set(stop.dayId, dayStops)
  }

  return dayRows.map((day) => ({
    id: day.id,
    dayNumber: day.dayNumber,
    date: day.date,
    title: day.title ?? null,
    notes: day.notes,
    stops: stopsByDayId.get(day.id) || [],
  }))
}

async function buildCollaboratorsPayload(event: H3Event, tripId: string): Promise<CollaboratorPayload[]> {
  const db = useAppDatabase(event)
  const collaboratorRows = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.tripId, tripId))
    .orderBy(desc(collaborators.createdAt))
    .all()

  const baseUrl = getBaseUrl(event)

  return collaboratorRows.map((collaborator) => ({
    id: collaborator.id,
    email: collaborator.email,
    role: collaborator.role,
    inviteToken: collaborator.inviteToken,
    inviteUrl: baseUrl ? `${baseUrl}/share/${collaborator.inviteToken}` : `/share/${collaborator.inviteToken}`,
    acceptedAt: collaborator.acceptedAt ?? null,
    createdAt: collaborator.createdAt,
  }))
}

async function reorderTripDays(event: H3Event, tripId: string, orderedDayIds: string[]) {
  const db = useAppDatabase(event)

  for (const [index, dayId] of orderedDayIds.entries()) {
    await db.update(tripDays).set({ dayNumber: index + 10_000 }).where(eq(tripDays.id, dayId))
  }

  for (const [index, dayId] of orderedDayIds.entries()) {
    await db.update(tripDays).set({ dayNumber: index + 1 }).where(eq(tripDays.id, dayId))
  }

  await touchTrip(event, tripId)
}

async function reorderDayStops(event: H3Event, dayId: string, orderedStopIds: string[]) {
  const db = useAppDatabase(event)

  for (const [index, stopId] of orderedStopIds.entries()) {
    await db.update(stops).set({ sortOrder: index + 10_000 }).where(eq(stops.id, stopId))
  }

  for (const [index, stopId] of orderedStopIds.entries()) {
    await db.update(stops).set({ sortOrder: index + 1 }).where(eq(stops.id, stopId))
  }
}

async function normalizeTripDays(event: H3Event, tripId: string) {
  const db = useAppDatabase(event)
  const orderedDayRows = await db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(asc(tripDays.dayNumber), asc(tripDays.date))
    .all()

  await reorderTripDays(event, tripId, orderedDayRows.map((row) => row.id))
}

async function normalizeStopOrder(event: H3Event, dayId: string, tripId: string) {
  const db = useAppDatabase(event)
  const orderedStopRows = await db
    .select({ id: stops.id })
    .from(stops)
    .where(eq(stops.dayId, dayId))
    .orderBy(asc(stops.sortOrder), asc(stops.createdAt))
    .all()

  await reorderDayStops(event, dayId, orderedStopRows.map((row) => row.id))
  await touchTrip(event, tripId)
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const copy = [...items]
  const [item] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, item!)
  return copy
}

async function touchTrip(event: H3Event, tripId: string) {
  const db = useAppDatabase(event)
  await db.update(trips).set({ updatedAt: new Date().toISOString() }).where(eq(trips.id, tripId))
}

function createDayValues(
  tripId: string,
  startDate: string,
  endDate: string,
): Array<typeof tripDays.$inferInsert> {
  const start = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)
  const dayValues: Array<typeof tripDays.$inferInsert> = []
  const cursor = new Date(start)
  let dayNumber = 1

  while (cursor <= end) {
    dayValues.push({
      id: crypto.randomUUID(),
      tripId,
      dayNumber,
      date: cursor.toISOString().slice(0, 10),
      title: dayNumber === 1 ? 'Departure day' : null,
      notes: '',
    })

    cursor.setUTCDate(cursor.getUTCDate() + 1)
    dayNumber++
  }

  return dayValues
}

function hasBucket(event: H3Event): boolean {
  const env = event.context.cloudflare?.env as Record<string, unknown> | undefined
  return Boolean(env?.BUCKET)
}

export async function listTrips(event: H3Event) {
  const db = useAppDatabase(event)
  const viewerId = getRequiredViewerId(event)
  const { page, pageSize } = readQueryWithSchema(event, paginationSchema)
  const offset = (page - 1) * pageSize

  const totalRow = await db
    .select({ total: count() })
    .from(trips)
    .where(eq(trips.userId, viewerId))
    .get()

  const tripRows = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, viewerId))
    .orderBy(desc(trips.updatedAt), desc(trips.createdAt))
    .limit(pageSize)
    .offset(offset)
    .all()

  if (!tripRows.length) {
    return {
      items: [] as TripListItem[],
      pagination: {
        page,
        pageSize,
        total: totalRow?.total ?? 0,
        pageCount: 0,
      },
    }
  }

  const tripIds = tripRows.map((trip) => trip.id)
  const dayRows = await db
    .select({ id: tripDays.id, tripId: tripDays.tripId })
    .from(tripDays)
    .where(inArray(tripDays.tripId, tripIds))
    .all()

  const dayCountByTrip = new Map<string, number>()
  for (const day of dayRows) {
    dayCountByTrip.set(day.tripId, (dayCountByTrip.get(day.tripId) || 0) + 1)
  }

  const stopCountByDay = new Map<string, number>()
  if (dayRows.length) {
    const stopRows = await db
      .select({ dayId: stops.dayId })
      .from(stops)
      .where(inArray(stops.dayId, dayRows.map((day) => day.id)))
      .all()

    for (const stop of stopRows) {
      stopCountByDay.set(stop.dayId, (stopCountByDay.get(stop.dayId) || 0) + 1)
    }
  }

  const stopCountByTrip = new Map<string, number>()
  for (const day of dayRows) {
    stopCountByTrip.set(day.tripId, (stopCountByTrip.get(day.tripId) || 0) + (stopCountByDay.get(day.id) || 0))
  }

  const total = totalRow?.total ?? 0

  return {
    items: tripRows.map((trip) =>
      toTripListItem(event, trip, dayCountByTrip.get(trip.id) || 0, stopCountByTrip.get(trip.id) || 0),
    ),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  }
}

export async function createTrip(event: H3Event) {
  await enforceRateLimit(event, 'trips:create', 12, 60_000)
  const db = useAppDatabase(event)
  const viewerId = getRequiredViewerId(event)
  const body = await readBodyWithSchema(event, tripCreateSchema)

  normalizeDateRange(body.startDate, body.endDate)

  const id = crypto.randomUUID()
  const shareSlug = createShareSlug(body.title)
  const nowIso = new Date().toISOString()

  await db.insert(trips).values({
    id,
    userId: viewerId,
    title: body.title,
    description: body.description,
    coverImageKey: normalizeOptionalText(body.coverImageKey),
    startDate: body.startDate,
    endDate: body.endDate,
    shareSlug,
    isPublic: body.isPublic,
    createdAt: nowIso,
    updatedAt: nowIso,
  })

  const initialDays = createDayValues(id, body.startDate, body.endDate)
  if (initialDays.length) {
    await db.insert(tripDays).values(initialDays)
  }

  const trip = await db.select().from(trips).where(eq(trips.id, id)).get()
  return trip ? serializeTrip(event, trip, await buildDaysPayload(event, id), []) : null
}

export async function getTripDetail(event: H3Event, tripId: string) {
  const trip = await getOwnedTripOrThrow(event, tripId)
  const [days, collaboratorsList] = await Promise.all([
    buildDaysPayload(event, tripId),
    buildCollaboratorsPayload(event, tripId),
  ])

  return serializeTrip(event, trip, days, collaboratorsList)
}

export async function updateTrip(event: H3Event, tripId: string) {
  await enforceRateLimit(event, 'trips:update', 30, 60_000)
  const db = useAppDatabase(event)
  const trip = await getOwnedTripOrThrow(event, tripId)
  const body = await readBodyWithSchema(event, tripUpdateSchema)

  const nextStartDate = body.startDate ?? trip.startDate
  const nextEndDate = body.endDate ?? trip.endDate
  normalizeDateRange(nextStartDate, nextEndDate)

  const nextShareSlug = body.shareSlug ? normalizeShareSlug(body.shareSlug) : trip.shareSlug

  try {
    await db
      .update(trips)
      .set({
        title: body.title ?? trip.title,
        description: body.description ?? trip.description,
        coverImageKey: body.coverImageKey === undefined ? trip.coverImageKey : normalizeOptionalText(body.coverImageKey),
        startDate: nextStartDate,
        endDate: nextEndDate,
        shareSlug: nextShareSlug,
        isPublic: body.isPublic ?? trip.isPublic,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(trips.id, tripId))
  }
  catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That share slug is already in use.',
      })
    }

    throw error
  }

  return getTripDetail(event, tripId)
}

export async function deleteTrip(event: H3Event, tripId: string) {
  await enforceRateLimit(event, 'trips:delete', 20, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)

  const days = await buildDaysPayload(event, tripId)
  const keysToDelete = days.flatMap((day) => day.stops.flatMap((stop) => stop.photoKeys))

  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).get()
  if (trip?.coverImageKey) {
    keysToDelete.push(trip.coverImageKey)
  }

  await db.delete(trips).where(eq(trips.id, tripId))

  if (keysToDelete.length && hasBucket(event)) {
    await deleteFromR2(event, keysToDelete)
  }

  return {
    deleted: true,
    tripId,
  }
}

export async function addTripDay(event: H3Event, tripId: string) {
  await enforceRateLimit(event, 'trips:days:create', 40, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  const body = await readBodyWithSchema(event, tripDayCreateSchema)

  const existingDays = await db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(asc(tripDays.dayNumber))
    .all()

  const nextDayId = crypto.randomUUID()
  const desiredDayNumber = Math.min(body.dayNumber ?? existingDays.length + 1, existingDays.length + 1)

  await db.insert(tripDays).values({
    id: nextDayId,
    tripId,
    dayNumber: existingDays.length + 1,
    date: body.date,
    title: normalizeOptionalText(body.title),
    notes: body.notes,
  })

  const orderedIds = [...existingDays.map((day) => day.id)]
  orderedIds.splice(desiredDayNumber - 1, 0, nextDayId)
  await reorderTripDays(event, tripId, orderedIds)

  return getTripDetail(event, tripId)
}

export async function updateTripDay(event: H3Event, tripId: string, dayId: string) {
  await enforceRateLimit(event, 'trips:days:update', 60, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  const day = await getDayOrThrow(event, tripId, dayId)
  const body = await readBodyWithSchema(event, tripDayUpdateSchema)

  await db
    .update(tripDays)
    .set({
      date: body.date ?? day.date,
      title: body.title === undefined ? day.title : normalizeOptionalText(body.title),
      notes: body.notes ?? day.notes,
    })
    .where(eq(tripDays.id, dayId))

  if (body.dayNumber && body.dayNumber !== day.dayNumber) {
    const orderedDays = await db
      .select({ id: tripDays.id })
      .from(tripDays)
      .where(eq(tripDays.tripId, tripId))
      .orderBy(asc(tripDays.dayNumber))
      .all()

    const fromIndex = orderedDays.findIndex((entry) => entry.id === dayId)
    const toIndex = Math.min(Math.max(body.dayNumber - 1, 0), orderedDays.length - 1)
    const reorderedIds = moveItem(orderedDays.map((entry) => entry.id), fromIndex, toIndex)
    await reorderTripDays(event, tripId, reorderedIds)
  }
  else {
    await touchTrip(event, tripId)
  }

  return getTripDetail(event, tripId)
}

export async function deleteTripDay(event: H3Event, tripId: string, dayId: string) {
  await enforceRateLimit(event, 'trips:days:delete', 60, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  await getDayOrThrow(event, tripId, dayId)

  const stopRows = await db
    .select({ photoKeys: stops.photoKeys })
    .from(stops)
    .where(eq(stops.dayId, dayId))
    .all()

  await db.delete(tripDays).where(eq(tripDays.id, dayId))

  const keysToDelete = stopRows.flatMap((row) => parsePhotoKeys(row.photoKeys))
  if (keysToDelete.length && hasBucket(event)) {
    await deleteFromR2(event, keysToDelete)
  }

  await normalizeTripDays(event, tripId)
  return getTripDetail(event, tripId)
}

export async function addStop(event: H3Event, tripId: string, dayId: string) {
  await enforceRateLimit(event, 'trips:stops:create', 80, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  await getDayOrThrow(event, tripId, dayId)
  const body = await readBodyWithSchema(event, stopCreateSchema)

  const existingStops = await db
    .select({ id: stops.id })
    .from(stops)
    .where(eq(stops.dayId, dayId))
    .orderBy(asc(stops.sortOrder), asc(stops.createdAt))
    .all()

  const stopId = crypto.randomUUID()
  const desiredSortOrder = Math.min(body.sortOrder ?? existingStops.length + 1, existingStops.length + 1)

  await db.insert(stops).values({
    id: stopId,
    dayId,
    name: body.name,
    description: body.description,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    address: body.address,
    category: body.category,
    sortOrder: existingStops.length + 1,
    photoKeys: JSON.stringify(body.photoKeys),
    url: normalizeOptionalText(body.url),
    createdAt: new Date().toISOString(),
  })

  const orderedIds = [...existingStops.map((entry) => entry.id)]
  orderedIds.splice(desiredSortOrder - 1, 0, stopId)
  await reorderDayStops(event, dayId, orderedIds)
  await touchTrip(event, tripId)

  return getTripDetail(event, tripId)
}

export async function updateStop(event: H3Event, tripId: string, dayId: string, stopId: string) {
  await enforceRateLimit(event, 'trips:stops:update', 120, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  await getDayOrThrow(event, tripId, dayId)
  const existingStop = await getStopOrThrow(event, dayId, stopId)
  const body = await readBodyWithSchema(event, stopUpdateSchema)

  await db
    .update(stops)
    .set({
      name: body.name ?? existingStop.name,
      description: body.description ?? existingStop.description,
      latitude: body.latitude === undefined ? existingStop.latitude : body.latitude,
      longitude: body.longitude === undefined ? existingStop.longitude : body.longitude,
      address: body.address ?? existingStop.address,
      category: body.category ?? existingStop.category,
      photoKeys: body.photoKeys ? JSON.stringify(body.photoKeys) : existingStop.photoKeys,
      url: body.url === undefined ? existingStop.url : normalizeOptionalText(body.url),
    })
    .where(eq(stops.id, stopId))

  if (body.sortOrder && body.sortOrder !== existingStop.sortOrder) {
    const orderedStops = await db
      .select({ id: stops.id })
      .from(stops)
      .where(eq(stops.dayId, dayId))
      .orderBy(asc(stops.sortOrder), asc(stops.createdAt))
      .all()

    const fromIndex = orderedStops.findIndex((entry) => entry.id === stopId)
    const toIndex = Math.min(Math.max(body.sortOrder - 1, 0), orderedStops.length - 1)
    const reorderedIds = moveItem(orderedStops.map((entry) => entry.id), fromIndex, toIndex)
    await reorderDayStops(event, dayId, reorderedIds)
  }

  await touchTrip(event, tripId)
  return getTripDetail(event, tripId)
}

export async function deleteStop(event: H3Event, tripId: string, dayId: string, stopId: string) {
  await enforceRateLimit(event, 'trips:stops:delete', 120, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  await getDayOrThrow(event, tripId, dayId)
  const stop = await getStopOrThrow(event, dayId, stopId)

  await db.delete(stops).where(eq(stops.id, stopId))

  const keysToDelete = parsePhotoKeys(stop.photoKeys)
  if (keysToDelete.length && hasBucket(event)) {
    await deleteFromR2(event, keysToDelete)
  }

  await normalizeStopOrder(event, dayId, tripId)
  return getTripDetail(event, tripId)
}

export async function inviteCollaborator(event: H3Event, tripId: string) {
  await enforceRateLimit(event, 'trips:collaborators:create', 30, 60_000)
  const db = useAppDatabase(event)
  await getOwnedTripOrThrow(event, tripId)
  const body = await readBodyWithSchema(event, collaboratorCreateSchema)
  const email = body.email.toLowerCase()

  try {
    await db.insert(collaborators).values({
      id: crypto.randomUUID(),
      tripId,
      email,
      role: body.role,
      inviteToken: crypto.randomUUID(),
      acceptedAt: null,
      createdAt: new Date().toISOString(),
    })
  }
  catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That collaborator has already been invited.',
      })
    }

    throw error
  }

  await touchTrip(event, tripId)
  return getTripDetail(event, tripId)
}

export async function getSharedTrip(event: H3Event, slug: string) {
  const db = useAppDatabase(event)
  const trip = await db
    .select()
    .from(trips)
    .where(and(eq(trips.shareSlug, slug), eq(trips.isPublic, true)))
    .get()

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Shared trip not found.',
    })
  }

  return serializeTrip(event, trip, await buildDaysPayload(event, trip.id), [])
}

export async function uploadTripPhoto(event: H3Event) {
  await enforceRateLimit(event, 'trips:upload', 40, 60_000)

  const files = await readMultipartFormData(event)
  const file = files?.find((entry) => entry.type && entry.data)

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Upload a file using multipart form data.',
    })
  }

  const extension = file.filename?.split('.').pop()?.toLowerCase()
  const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'bin'
  const key = `trip-media/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${safeExtension}`

  const arrayBuffer = new Uint8Array(file.data).slice().buffer
  await uploadToR2(event, key, arrayBuffer, file.type)

  return {
    key,
    url: getAssetUrl(key),
    contentType: file.type || 'application/octet-stream',
  }
}

export async function getTripAsset(event: H3Event, key: string) {
  const env = event.context.cloudflare?.env as { BUCKET?: R2Bucket } | undefined
  const bucket = env?.BUCKET

  if (!bucket) {
    throw createError({
      statusCode: 500,
      statusMessage: 'R2 bucket binding is not configured.',
    })
  }

  const object = await bucket.get(key)
  if (!object) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Asset not found.',
    })
  }

  const headers = new Headers({
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType)
  }

  if (object.httpEtag) {
    headers.set('ETag', object.httpEtag)
  }

  return new Response(await object.arrayBuffer(), {
    headers,
  })
}
