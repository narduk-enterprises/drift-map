import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const stopCategories = ['food', 'lodging', 'activity', 'transport', 'sightseeing'] as const
export type StopCategory = typeof stopCategories[number]

export const collaboratorRoles = ['owner', 'editor', 'viewer'] as const
export type CollaboratorRole = typeof collaboratorRoles[number]

const now = () => new Date().toISOString()

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  coverImageKey: text('cover_image_key'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  shareSlug: text('share_slug').notNull().unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(now),
  updatedAt: text('updated_at').notNull().$defaultFn(now),
})

export const tripDays = sqliteTable(
  'trip_days',
  {
    id: text('id').primaryKey(),
    tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    date: text('date').notNull(),
    title: text('title'),
    notes: text('notes').notNull().default(''),
  },
  (table) => ({
    tripDayNumberUnique: uniqueIndex('trip_days_trip_day_number_idx').on(table.tripId, table.dayNumber),
  }),
)

export const stops = sqliteTable(
  'stops',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id').notNull().references(() => tripDays.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    latitude: real('latitude'),
    longitude: real('longitude'),
    address: text('address').notNull().default(''),
    category: text('category').$type<StopCategory>().notNull().default('activity'),
    sortOrder: integer('sort_order').notNull().default(0),
    photoKeys: text('photo_keys').notNull().default('[]'),
    url: text('url'),
    createdAt: text('created_at').notNull().$defaultFn(now),
  },
  (table) => ({
    daySortOrderUnique: uniqueIndex('stops_day_sort_order_idx').on(table.dayId, table.sortOrder),
  }),
)

export const collaborators = sqliteTable(
  'collaborators',
  {
    id: text('id').primaryKey(),
    tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').$type<CollaboratorRole>().notNull().default('viewer'),
    inviteToken: text('invite_token').notNull().unique(),
    acceptedAt: text('accepted_at'),
    createdAt: text('created_at').notNull().$defaultFn(now),
  },
  (table) => ({
    tripEmailUnique: uniqueIndex('collaborators_trip_email_idx').on(table.tripId, table.email),
  }),
)

export type Trip = typeof trips.$inferSelect
export type NewTrip = typeof trips.$inferInsert
export type TripDay = typeof tripDays.$inferSelect
export type NewTripDay = typeof tripDays.$inferInsert
export type Stop = typeof stops.$inferSelect
export type NewStop = typeof stops.$inferInsert
export type Collaborator = typeof collaborators.$inferSelect
export type NewCollaborator = typeof collaborators.$inferInsert
