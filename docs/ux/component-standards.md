# Component Standards

## Buttons

- Use `UButton` for all clickable actions.
- Primary CTA: `color="primary"` with the default solid variant.
- Secondary action: `color="neutral"` with `variant="outline"`.
- Quiet/destructive utility action: `color="neutral"` with `variant="ghost"` unless a dedicated destructive pattern is added.
- Segmented state controls: use `variant="outline"` plus `:active`, `active-color`, and `active-variant`; do not swap raw classes.

## Forms

- Use `UFormField` for every labeled input.
- Use `UInput` and `UTextarea` with full-width layout inside the field.
- Help and error copy should remain directly adjacent to the related field or action.
- Selection states must be readable without relying on color alone.

## Cards

- Use `UCard` for structural card shells.
- Use `.glass-card` for elevated, atmospheric surfaces.
- Use `.card-base` for dense content cards with hover affordance.
- Card radius should resolve through `--radius-card`, not custom one-off rounding decisions.

## Lists And Timelines

- Read-only itinerary lists should prefer static presentation over optional toggles.
- Reordering controls belong only in editor surfaces, never public review surfaces.

## Loading States

- Use skeleton blocks based on `.card-base` plus `animate-pulse`.
- Reserve layout space so loading states do not shift the page structure.

## Empty States

- Use a card shell, one illustration, one headline, one concise explanation, and one primary action.

## Error States

- Use `UAlert` for route-level or mutation-level failures.
- Inline status text must remain stable in layout and should be announced via live regions when it changes after user input.
