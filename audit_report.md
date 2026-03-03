# DriftMap Template Audit

Date audited: March 2-3, 2026

## 1. Did `pnpm setup` complete smoothly? Were all string replacements correct?

No.

The command completed without crashing, but it reported `No changes to the environment were made.` and did not fully finish the expected rename pass. After setup, `apps/web` still contained template metadata and placeholder code (for example, the stock homepage and the sample `/api/users` route were still present, and app identity strings still needed manual cleanup). The git remote was already safe (`https://github.com/loganrenz/drift-map.git`), so there was no template-push risk, but the setup script did not leave the app in a fully "ready to build" renamed state.

## 2. Did Drizzle migration and `nitro-cloudflare-dev` binding work out of the box?

Partially.

What worked:

- `nitro-cloudflare-dev` worked correctly once it was explicitly configured in `apps/web` with the app's `wrangler.json`.
- Local D1 and local R2 bindings both worked in `nuxt dev` after configuration.
- `pnpm --filter web run db:migrate` applied the SQL successfully to local D1.
- `/api/upload` successfully wrote to local R2 and the asset route served the uploaded file after a response bug was fixed.

What did not work cleanly out of the box:

- `drizzle-kit generate` initially produced a second `0000_*` migration because the template does not ship a complete Drizzle migration history baseline.
- `drizzle-kit push` was only reliable after pointing `apps/web/drizzle.config.ts` at a local SQLite file and simplifying `apps/web/server/database/schema.ts` to re-export the app schema package cleanly for Drizzle resolution.
- `drizzle-kit push` generated a local SQLite file in `apps/web/drizzle/` that was not git-ignored by default. I added `**/drizzle/*.sqlite` to `.gitignore`.

## 3. Did Nuxt layer inheritance work seamlessly?

Mostly, but not seamlessly.

The layer itself is useful and provided the expected shared capabilities (SEO helpers, security middleware, D1 helpers, R2 helpers, base design tokens, app shell). The `apps/web` app was able to extend it normally.

The friction is that the layer still contained its own quality noise:

- `layers/narduk-nuxt-layer/app/composables/useFormat.ts` triggered avoidable composable-name lint warnings because it exported plain formatter functions from a composables file. I fixed that by keeping the formatter helpers internal and only exporting `useFormat()`.

So inheritance worked, but the layer was not fully warning-free before app work began.

## 4. Any pre-existing TypeScript errors from `pnpm typecheck`?

No pre-existing TypeScript errors surfaced in the DriftMap app path after implementation.

Current app-specific checks:

- `pnpm --filter web quality` passes
- `pnpm --filter web build` passes

Workspace-wide, `pnpm run quality` still emits template warnings outside `apps/web`, but they are warnings, not TypeScript failures.

## 5. Did documentation (`AGENTS.md`, `BUILD_TEST_APP.md`) accurately guide you?

Partially.

`AGENTS.md` was helpful overall. It correctly described the monorepo structure, the layer responsibilities, the Cloudflare/D1 architecture, and the need for `nitro-cloudflare-dev`.

But it was not fully aligned with reality:

- `tools/BUILD_TEST_APP.md` did not exist.
- The "only modify `apps/web`" guidance was too strict in practice because I had to patch shared workspace issues (`.gitignore`, a layer lint warning, and an ESLint-plugin test warning) to clean up template friction.
- The setup documentation overstates how complete the `pnpm setup` pass is; manual cleanup was still required immediately afterward.

## 6. Any HMR port collisions, Tailwind issues, or Doppler token errors?

Yes, on two of the three.

- HMR/dev port collision: `nuxt dev` could not bind to port 3000 on March 2-3, 2026 and automatically fell back to port 3001. The fallback worked correctly.
- Tailwind: the DriftMap app itself built cleanly, but the shared layer still emits a Vite/Tailwind sourcemap warning during workspace-wide builds:
  - `[plugin @tailwindcss/vite:generate:build] Sourcemap is likely to be incorrect...`
- Doppler: no blocking Doppler token error occurred. The setup script effectively skipped environment mutation, and the app could still be developed locally without Doppler.

Additional workspace warning still present outside `apps/web`:

- `apps/example-blog` emits an `@nuxt/content` warning about switching to D1 during `pnpm run quality`.

## 7. Did the Brand Identity workflow (`generate-brand-identity.md`) work smoothly end-to-end?

Not fully.

The workflow structure was useful, and the design steps were workable, but one tool dependency was missing in this runtime:

- The workflow expects a `generate_image` tool. That tool was not available.

Fallback used:

- I implemented the brand system manually with a clear direction (teal + stone palette, `Fraunces` + `Manrope`, travel-journal visual language).
- I created SVG-based brand assets manually (logo/favicon source, hero background, empty-state illustrations).
- `pnpm generate:favicons` succeeded, but it emitted npm config warnings about unknown config keys while running.
- Visual verification was completed with local screenshots:
  - `/tmp/driftmap-home.png`
  - `/tmp/driftmap-share-mobile.png`

So the workflow was usable, but not smooth end-to-end because the image-generation step could not be executed as written.

## 8. Was the R2 binding straightforward to configure for photo uploads?

Mostly yes.

The `wrangler.json` R2 bucket binding was straightforward, and local R2 worked correctly in development through the Cloudflare dev bindings. Uploading via `/api/upload` succeeded immediately once the route existed.

The main issue was in the first implementation of the asset read route, not the binding itself:

- Returning an `ArrayBuffer` directly from the API handler caused Nitro to serialize the payload as `{}` instead of returning file bytes.
- I fixed this by returning a real `Response` with binary body and headers from the asset helper.

After that fix, local upload and retrieval both worked correctly.

## Additional Friction Encountered

- The local ESLint plugin test suite emitted avoidable Vite parser warnings because of duplicate `filename` keys in a test fixture. I fixed that test.
- Nuxt Icon initially warned in dev because the `lucide` icon collection was not installed locally. I added `@iconify-json/lucide`, and the warning disappeared.
- `pnpm install` / `pnpm add` still emit peer/deprecation warnings in template packages outside `apps/web`. Those are upstream workspace hygiene issues, not DriftMap runtime blockers.

## Current Validation Snapshot

DriftMap (`apps/web`) is in good shape:

- `pnpm --filter web quality` passes
- `pnpm --filter web build` passes
- Runtime sanity checks passed for:
  - `/api/health`
  - `/api/trips`
  - trip creation
  - stop creation
  - public share fetch
  - `/api/upload`
  - `/api/assets/...`
  - SSR share page with OG meta

The workspace is not fully warning-free because template-owned packages still emit non-fatal warnings during `pnpm run quality`:

- `layers/narduk-nuxt-layer` build chunk-size warning
- `layers/narduk-nuxt-layer` Tailwind sourcemap warning
- `layers/narduk-nuxt-layer` Cloudflare node-compat warning
- `apps/example-blog` `@nuxt/content` D1 warning
