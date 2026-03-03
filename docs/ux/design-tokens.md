# Design Tokens

## Source Of Truth

- Structural tokens live in `apps/web/app/assets/css/main.css`.
- Nuxt UI component-level enforcement lives in `apps/web/app/app.config.ts`.

## Locked Tokens

### Semantic Colors

- `primary`: `teal`
- `neutral`: `stone`
- Usage rule: use Nuxt UI semantic colors (`primary`, `neutral`, `error`) instead of ad-hoc color names for component states

### Typography

- `--font-sans`: `Manrope`
- `--font-display`: `Fraunces`
- Usage rule: body copy defaults to sans; page and section headlines use display styling

### Spacing

- The app currently uses Nuxt UI size scales plus layout spacing in templates (`gap-*`, `p-*`, `px-*`)
- Usage rule: keep spacing tied to Nuxt UI component sizing first, then use layout utilities only for section composition

### Border Radii

- `--radius-card`
- `--radius-button`
- `--radius-input`
- Enforcement: `UCard`, `UButton`, `UInput`, and `UTextarea` are now mapped to those tokens in app config

### Elevation And Motion

- `--shadow-card`
- `--shadow-elevated`
- `--shadow-overlay`
- `--transition-fast`
- `--transition-base`
- `--transition-slow`
- `--transition-spring`

## Guardrails

- Do not hardcode component-level color swaps for selected states; prefer Nuxt UI variants and active states.
- Do not introduce alternate radius classes for core controls unless a new token is added first.
- Keep glass and card presentation tied to shared utility classes instead of page-local restyling.
