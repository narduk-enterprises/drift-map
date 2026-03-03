# UX Workflow

This folder captures the first controlled UX pass for `apps/web/`.

Current scope:

- Phases 1-3 are documented as code-level audits based on the current routes, components, and data-fetching patterns.
- Phase 4 is partially enforced in code by locking shared Nuxt UI radii and control styling in `apps/web/app/app.config.ts`.
- Phase 5 is represented by Sprint 1, focused on the read-only itinerary review journey.

Status:

- Journey definitions: complete
- Friction map: complete
- Rendering and hydration audit: complete
- Design token lock: complete for shared controls, documented for the rest
- Sprint 1: implemented
- Accessibility and performance gates: partially validated with lint/typecheck; lab metrics still need browser capture

Next loop:

1. Capture actual Web Vitals for `/`, `/trips`, and `/share/[slug]`.
2. Convert the static landing route to explicit prerendering once deploy behavior is confirmed in the current Cloudflare setup.
3. Standardize segmented button groups in create/edit flows using `UButton` active state and remove remaining ad-hoc state classes.
