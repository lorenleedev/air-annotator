# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AIR (AI-Readable Annotator) is a **Figma plugin** that lets designers annotate UI layers with structured tags so AI tools can parse design specs from a Figma link. Annotations are stored as visual panels on the canvas and as hidden data nodes within the Figma file.

## Commands

- **Run tests:** `node test.js`
- **No build step.** The plugin is plain JS/HTML loaded directly by Figma's plugin runtime.

## Architecture

### Two-thread Figma plugin model

- **`code.js`** — Runs in Figma's sandbox (main thread). Has access to the Figma document API (`figma.*`). Creates/reads/deletes nodes on the canvas.
- **`ui.html`** — Plugin UI (iframe). Contains all HTML, CSS, and client-side JS in a single file. No framework; vanilla JS.
- **Communication:** `figma.ui.postMessage()` (code→UI) and `parent.postMessage({ pluginMessage: ... })` (UI→code). Message types are string-keyed (e.g., `"write-desc"`, `"list-specs"`, `"delete-spec"`).
- **`manifest.json`** — Figma plugin manifest. `editorType: ["figma"]`, no network access, `documentAccess: "dynamic-page"`.

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

English (`en`) and Korean (`ko`) via the `I18N` object in `ui.html`. Applied through `data-i18n`, `data-i18n-html`, `data-i18n-ph`, `data-i18n-tip` attributes.

### Migration compatibility

The plugin was renamed from "Spec" to "Annotation". All code that reads panel names checks both `📋 Annotation: N` and `📋 Spec: N`. New panels are always created with the "Annotation" name. When modifying panel name matching, always handle both old and new names.

## Key Conventions

- **No ES6+.** The codebase uses `var`, `function`, and `for` loops throughout (Figma plugin sandbox compatibility). Maintain this style.
- **Font loading** tries Inter → Roboto → Arial in order. `FONT_R`/`FONT_B` are set once at init.
- **Panel width** is fixed at `PANEL_W = 360`. Gap from target is `PANEL_GAP = 60`.
- **Numbering** is global per page, auto-incrementing from the max existing number. Cached in page `pluginData("airMaxNum")`.

## Testing

Tests (`test.js`) mock the Figma API and test pure logic: tag parsing, numbering, hidden data read/write, layer scanning/filtering, migration compatibility, syntax validation, and UI text consistency. Run with `node test.js` — no dependencies needed.
