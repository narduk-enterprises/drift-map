---
description: Comprehensive audit of Nuxt 4 + Nuxt UI 4 Layer Template — Structure, UI v4, Layer Health, and Edge Compliance
---

# Nuxt Template Compliance Audit

This workflow provides a deep-thinking audit of the **Nuxt 4 + Nuxt UI 4** monorepo template. It consolidates architectural standards, UI best practices, and layer inheritance health into a single high-fidelity check.

## 1. Repository & Framework Structure

Verify the foundational monorepo and Nuxt 4 setup.

1.  **PNPM Workspace Integrity**
    - Ensure `apps/web` and `layers/narduk-nuxt-layer` exist.
    - Check `pnpm-workspace.yaml`.
2.  **Nuxt 4 Compatibility**
    - Verify `compatibilityVersion: 4` is set in both `apps/web/nuxt.config.ts` and the layer.
    - Confirm use of the `app/` directory (not `src/` or root-level pages/components).
3.  **Nitro preset**
    - Ensure `nitro.preset` is `cloudflare-module` for edge compatibility.

---

## 2. Nuxt UI 4 & Tailwind 4 Styling

Incorrect setup here is the primary cause of unstyled components.

1.  **CSS Import Order & Theme Prefix** (CRITICAL)
    - The `app/assets/css/main.css` MUST import in this order: 1. `@import "tailwindcss";` 2. `@import "@nuxt/ui";`
      // turbo
      `head -n 5 apps/web/app/assets/css/main.css`
    - If a prefix is used (e.g. `@import "tailwindcss" prefix(tw);`), verify that `ui.theme.prefix: 'tw'` is set in `nuxt.config.ts` so components receive correct base CSS variables.
2.  **Design Token Compliance**
    - No hardcoded hex/rgb colors in components.
    - Preference for `primary` and `neutral` tokens.
    - Check `app.config.ts` for Correct UI color configuration.
3.  **Component API Renames**
    - `UDivider` → `USeparator`
    - `UDropdown` → `UDropdownMenu`
    - `USelectMenu`: `value-attribute` → `value-key`, `option-attribute` → `label-key`.
    - Icons use `i-` prefix (e.g., `i-lucide-home`).

---

## 3. Nuxt Layer Health (Inheritance Audit)

Detect "Shadowing" and redundant code that defeats the purpose of the layer.

1.  **Priority Precedence**
    - Verify layer priority is intentional: Application Code > Auto-Scanned `layers/` directory > Configured `extends` array in `nuxt.config.ts`.
2.  **File-Level Shadowing**
    - Compare `apps/web/app/` against `layers/narduk-nuxt-layer/app/`.
    - Flag files with identical names. Determine if they are **intentional overrides** or **accidental duplication**.
    - **CRITICAL: Auto-Import Collision:** Extensively check `app/composables/`, `app/utils/`, and `server/api/` routes. App-level files completely overwrite layer files with the exact same name.
    - **CRITICAL: Public Asset Shadowing:** Verify the `public/` directory (e.g., `favicon.ico`, `robots.txt`) is not unintentionally overriding the layer's global assets.
3.  **Dependency Bloat**
    - Downstream `package.json` should not duplicate dependencies provided by the layer.
4.  **Config Isolation & Redundancy**
    - Check if the app's `nuxt.config.ts` re-declares modules or settings already defined in the layer's config.
    - Ensure the _layer_ `nuxt.config.ts` does not contain rigid, app-specific configurations (like hard-coded absolute production URLs) that break inheritance.

---

## 4. SSR & Hydration Safety

"Golden Patterns" for stable server-side rendering.

1.  **The `isHydrated` Guard**
    - Check for `const isHydrated = ref(false); onMounted(() => isHydrated.value = true)` in components with live data.
2.  **Client-Only Logic**
    - Ensure `window`/`document` access is wrapped in `if (import.meta.client)` or `<ClientOnly>`.
3.  **Data Fetching**
    - Use `useAsyncData` or `useFetch`. NO raw `$fetch` in `<script setup>`.
    - No `ref()` at module scope (use `useState`).

---

## 5. Edge & Database Compliance (Cloudflare)

Verify compatibility with the V8 isolate environment.

1.  **No Node Storefronts**
    - Check for `fs`, `path`, `child_process`, or `crypto` (standard Node module).
2.  **Web Crypto enforcement**
    - Use `crypto.subtle` for PBKDF2/Hashing. No `bcrypt` or `jsonwebtoken` (Node-dependent).
3.  **D1 & Drizzle Integration**
    - Verify `wrangler.json` bindings for D1.
    - Ensure Drizzle schemas are defined in `server/database/schema.ts`.

---

## 6. SEO & Analytics (Institutional Standards)

1.  **SEO Composable Usage**
    - Every page should call `useSeo()` and a Schema.org composable (`useWebPageSchema`, etc.).
2.  **Analytics Wiring**
    - Plugins for PostHog and GA4 should be present in the layer and no-op without keys.
3.  **Doppler Pattern**
    - No `.env` files. Secrets must be mapped via `process.env` in `nuxt.config.ts`.

---

## 7. Audit Report Template

Compile findings into this format:

| Category     | Finding                        | Severity | Recommendation               |
| :----------- | :----------------------------- | :------- | :--------------------------- |
| UI/Styling   | Mismatched `theme.prefix`      | 🔴       | Match UI config to Tailwand  |
| UI/Styling   | e.g. Hardcoded Hex in X.vue    | 🟠       | Replace with `primary` token |
| Layer Health | Shadowed `server/api/user.ts`  | 🔴       | Resolve routing conflict     |
| Layer Health | e.g. Shadowed `UserAvatar.vue` | 🟡       | Delete downstream copy       |
| SSR Safety   | e.g. Raw `$fetch` in `app.vue` | 🔴       | Switch to `useAsyncData`     |
| Edge         | e.g. Use of `node:fs`          | 🔴       | Switch to R2 or D1           |

**Severities:**

- 🔴 **Breaking**: Critical bug, logic collision, or incompatible with edge.
- 🟠 **Violation**: Design system or SSR pattern violation.
- 🟡 **Wasteful**: Duplication or shadowing.
- 🟢 **Advancement**: Opportunity to improve.
