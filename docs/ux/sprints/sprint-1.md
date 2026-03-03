# Sprint 1

## Journey

- Journey 3: Review and share an itinerary

## Selected Fixes

1. Remove the day collapse control from read-only itinerary pages and keep day sections expanded.
2. Remove stop photo pager controls from read-only itinerary pages and default to the first image.
3. Make share-link feedback persistent and announceable so copy success/failure does not shift layout.

## Why These Three

- They target the highest-traffic read surfaces after creation.
- They reduce non-essential hydration work without changing the data model.
- They improve scan speed and assistive clarity with minimal product risk.

## Implementation

- `apps/web/app/pages/trips/[id]/index.vue`: use `DayTimeline` in readonly mode on the owner preview route.
- `apps/web/app/components/DayTimeline.vue`: suppress collapse controls in readonly mode and keep the section expanded.
- `apps/web/app/components/StopCard.vue`: suppress photo paging controls in readonly mode and render the first image only.
- `apps/web/app/components/ShareBanner.vue`: add a persistent live status message.

## Before And After Proxy Metrics

These are code-level proxies captured from the implementation, not browser lab metrics:

- Day-level interactive controls on read routes: from `1 per rendered day` to `0`
- Stop-level interactive photo controls on read routes: from `0..N per stop with multiple photos` to `0`
- Share-link status area: from `conditional inline text` to `persistent reserved status region`

## Validation

- Intended validation: lint + typecheck
- Remaining required validation before merge: capture LCP, INP, and CLS for `/trips/[id]` and `/share/[slug]` in a browser run

## Follow-Up

- Convert `/` to explicit prerendering
- Standardize create/edit segmented controls on top of the new token lock
