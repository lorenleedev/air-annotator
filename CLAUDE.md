# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AIR (AI-Readable Annotator) is a **Figma plugin** that lets designers annotate UI layers with structured tags so AI tools can parse design specs from a Figma link. Annotations are stored as visual panels on the canvas and as hidden data nodes within the Figma file.

## Commands

- **Build:** `npm run build` — compiles `src/code.ts` → `code.js` via esbuild (IIFE format), assembles `src/ui/` → `ui.html`
- **Watch:** `npm run watch` — rebuild on file changes (both `code.ts` and `src/ui/`)
- **Type check:** `npm run typecheck` — runs `tsc --noEmit` with strict mode
- **Run tests:** `npm test` — runs `node test.js`

## Architecture

### Two-thread Figma plugin model

- **`src/code.ts`** — TypeScript source for Figma's sandbox (main thread). Has access to the Figma document API (`figma.*`). Creates/reads/deletes nodes on the canvas. Compiled to `code.js` by esbuild.
- **`code.js`** — Build output (IIFE bundle). Referenced by `manifest.json`. Do not edit directly.
- **`ui.html`** — Plugin UI (iframe). Build output assembled from `src/ui/` source files. Do not edit directly.
- **`src/ui/`** — UI source files split into `styles.css`, `template.html`, and 9 JS modules (`i18n.js`, `lang.js`, `theme.js`, `core.js`, `export.js`, `list.js`, `onboarding.js`, `messages.js`, `init.js`). No framework; vanilla JS.
- **Communication:** `figma.ui.postMessage()` (code→UI) and `parent.postMessage({ pluginMessage: ... })` (UI→code). Message types are string-keyed (e.g., `"write-desc"`, `"list-specs"`, `"delete-spec"`).
- **`manifest.json`** — Figma plugin manifest. `editorType: ["figma"]`, no network access, `documentAccess: "dynamic-page"`.

### Build pipeline

- **Source:** `src/code.ts` (single file, no splitting) + `src/ui/` (CSS, HTML, JS modules)
- **Bundler:** esbuild (`esbuild.mjs`) — IIFE format, ES2015 target, UTF-8 charset for code.ts; custom `buildUI()` function assembles `src/ui/` → `ui.html`
- **Type checking:** `tsc --noEmit` with `strict: true`, types from `@figma/plugin-typings`
- **Output:** `code.js` + `ui.html` (root directory, both referenced by `manifest.json`)
- **UI JS concatenation order:** i18n → lang → theme → core → export → list → onboarding → messages → init. All functions use `function` keyword (hoisted). `init.js` must be last (contains immediate execution code).

### Data model

Each annotation produces three artifacts on the Figma canvas:
1. **Panel** (`📋 Annotation: N`) — Visual card with header, tag rows, footer. Created via `createSpecPanel()`.
2. **Marker badge** (`🏷️ N`) — Small numbered badge placed on/near the target layer. Created via `createMarkerBadge()`.
3. **Hidden data node** (`__specData_N__`) — Invisible locked text node storing raw annotation data in a custom format (`[AIRA:N]\ntitle: ...\ncolor: ...\ntarget: ...\n===\ndesc`). This is the primary data source; panel `pluginData` is a fallback.

Layer names get prefixed with `[AIR-N]` plus a summary (e.g., `[AIR-3] Login | api · ux`).

### Tag system

Annotations use bracket-prefixed tags parsed by `parseTags()`:
- `[route]`, `[auth]`, `[api]`, `[ux]`, `[warn]`, `[memo]`, `[desc]`
- Tags are case-sensitive (lowercase only). Untagged lines become `desc`.

### AI spec index

`updateSpecIndex()` generates a `📑 AIR: AI-Readable Annotator Index` frame — a machine-readable summary of all annotations on the current page, positioned to the far right of the canvas.

### Theme system

Light/dark themes for annotation panels (not the plugin UI, which uses Figma's `themeColors`). Theme state persists via `figma.root.setPluginData("airTheme", ...)`. Toggling rebuilds all panels on the page.

### i18n

English (`en`) and Korean (`ko`) via the `I18N` object in `src/ui/i18n.js`. Applied through `data-i18n`, `data-i18n-html`, `data-i18n-ph`, `data-i18n-tip` attributes.

### Migration compatibility

The plugin was renamed from "Spec" to "Annotation". All code that reads panel names checks both `📋 Annotation: N` and `📋 Spec: N`. New panels are always created with the "Annotation" name. When modifying panel name matching, always handle both old and new names.

## Key Conventions

- **TypeScript with `strict: true`.** Source lives in `src/code.ts`. Uses `let`/`const`, `function` keyword, and `for` loops (no arrow functions, no `.map`/`.filter`). Types from `@figma/plugin-typings` for Figma API.
- **Single file.** All plugin logic stays in `src/code.ts` — do not split into modules.
- **Font loading** tries Inter → Roboto → Arial in order. `FONT_R`/`FONT_B` are `FontName | undefined`, set once at init.
- **Panel width** is fixed at `PANEL_W = 360`. Gap from target is `PANEL_GAP = 60`.
- **Numbering** is global per page, auto-incrementing from the max existing number. Cached in page `pluginData("airMaxNum")`.

## Testing

Tests (`test.js`) mock the Figma API and test pure logic: tag parsing, numbering, hidden data read/write, layer scanning/filtering, migration compatibility, syntax validation, and UI text consistency. Tests read the built `code.js` for string checks (suites 10-12). Run with `npm test` — no test framework needed.
