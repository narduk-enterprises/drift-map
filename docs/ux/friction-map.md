# Friction Map

## 1. Landing Route Has No Explicit Static Strategy

- Location: `/` via `apps/web/nuxt.config.ts`
- Symptom: The marketing page is static in content but still relies on default runtime SSR behavior.
- Hypothesized cause: No explicit `routeRules` override exists for the homepage.
- Category: Rendering
- Impact level: High

## 2. Create/Edit Flows Still Use Repeated Ad-Hoc State Styling

- Location: `/trips/new`, `/trips/[id]/edit`, `TripEditor*` controls
- Symptom: Segmented controls rely on repeated inline class switching instead of a single Nuxt UI state pattern.
- Hypothesized cause: State emphasis was added quickly with class bindings instead of standard `UButton` active behavior.
- Category: Design inconsistency
- Impact level: High

## 3. Read-Only Itinerary Pages Shipped Non-Essential Toggle UI

- Location: `/trips/[id]`, `/share/[slug]`, `apps/web/app/components/DayTimeline.vue`
- Symptom: Every day card offered a collapse/expand control even on pages meant purely for reading.
- Hypothesized cause: The component was optimized for reuse before the read-only journey was separated from editing concerns.
- Category: Hydration
- Impact level: High

## 4. Read-Only Stop Cards Exposed Interactive Photo Paging

- Location: `/trips/[id]`, `/share/[slug]`, `apps/web/app/components/StopCard.vue`
- Symptom: Stops with multiple photos rendered per-stop state and pager buttons on read-only pages.
- Hypothesized cause: The same interactive gallery behavior was reused for both editing-adjacent and public review surfaces.
- Category: Hydration
- Impact level: High

## 5. Share Link Feedback Could Shift Layout and Miss Assistive Announcements

- Location: `/trips/[id]`, `apps/web/app/components/ShareBanner.vue`
- Symptom: Copy failures only appeared conditionally, which could move nearby controls and offered no persistent status text.
- Hypothesized cause: Feedback was modeled as a transient inline error only.
- Category: Accessibility
- Impact level: Medium

## 6. Dashboard Data Is Fully Blocking

- Location: `/trips`, `apps/web/app/composables/useTripsData.ts`
- Symptom: The route waits on the trip list before resolving its primary content state.
- Hypothesized cause: The dashboard is using route-level `useFetch` with a blocking setup await.
- Category: Interaction latency
- Impact level: Medium
