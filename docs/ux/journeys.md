# User Journeys

## Journey 1: Land and Start a Trip

| Field | Value |
| --- | --- |
| Entry route | `/` |
| Core action | Understand the product quickly and start a new itinerary |
| Completion state | User reaches `/trips/new` and begins filling the form |
| Success time threshold | Under 30 seconds from first paint to first form input |
| Drop-off risk | Marketing page is currently SSR by default with no explicit prerender rule, so TTFB variance can blunt the CTA moment |

## Journey 2: Create and Edit an Itinerary

| Field | Value |
| --- | --- |
| Entry route | `/trips/new` |
| Core action | Create a trip, then add days, stops, and collaborators in `/trips/[id]/edit` |
| Completion state | At least one day and one stop exist, and the trip is saveable/shareable |
| Success time threshold | Under 3 minutes for first useful itinerary draft |
| Drop-off risk | Dense forms, repeated segmented controls, and a long editor can slow decision-making on mobile |

## Journey 3: Review and Share an Itinerary

| Field | Value |
| --- | --- |
| Entry route | `/trips/[id]` or `/share/[slug]` |
| Core action | Scan the route quickly, confirm details, and share or consume the read-only itinerary |
| Completion state | User can read all days and stops without confusion and, when public, copy the share link |
| Success time threshold | Under 45 seconds to verify the itinerary and share it |
| Drop-off risk | Read-only pages carried avoidable interactive controls that increased hydration cost and added non-essential decisions |
