# Rendering And Hydration Audit

## Route Strategy

| Route | Current mode | Intended mode | Blocking fetches | Client-only candidates | Hydration notes |
| --- | --- | --- | --- | --- | --- |
| `/` | SSR by default | SSG or prerender | None | None | Mostly static marketing surface; best candidate for static delivery |
| `/trips` | SSR | SSR | `useFetch('/api/trips')` in setup | None | Dashboard cards are light; pagination buttons are necessary |
| `/trips/new` | SSR | SSR | None | `PhotoUploader` if upload enhancements grow | Form is interactive but fetch-light |
| `/trips/[id]` | SSR | SSR | `useAsyncData(getTrip)` | None today | Read-only review surface should minimize controls; sprint 1 reduces this |
| `/trips/[id]/edit` | SSR | SSR | `useAsyncData(getTrip)` | Uploaders and advanced drag/drop if future islanding is added | Highest hydration surface in the app |
| `/share/[slug]` | SSR | SSR today, future ISR once freshness policy is defined | `useAsyncData(getSharedTrip)` | None today | Public-facing read route benefits most from low interactivity |

## LCP Candidates

- `/`: hero headline block plus the example itinerary card in the first section
- `/trips`: dashboard header shell, then the first card row
- `/trips/[id]` and `/share/[slug]`: the hero cover section

## INP Hotspots

- Trip editor drag-and-drop flows across days and stops
- Photo upload loops in `apps/web/app/components/PhotoUploader.vue`
- Dashboard delete and refresh actions that wait on network completion

## TTFB Variance Sources

- D1-backed API calls on trip detail, share, and dashboard routes
- No explicit caching policy for the landing route despite static content
- Public share pages currently render live data on every request

## Hydration-Heavy Components

- `apps/web/app/components/TripEditor.vue`
- `apps/web/app/components/TripEditorDayCard.vue`
- `apps/web/app/components/TripEditorStopCard.vue`
- `apps/web/app/components/PhotoUploader.vue`

## Audit Notes

- There are no explicit `routeRules` today.
- The read-only routes were carrying editor-adjacent controls. Sprint 1 removes the day collapse toggle and stop photo pager behavior from read-only usage.
- The next high-value performance move is explicit prerendering for `/`, followed by a defined caching policy for public share routes.
