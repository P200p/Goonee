# Goonee UI Naming Convention (go- prefix)

To prevent CSS/DOM collisions when embedding our tools into arbitrary webpages, all UI classes for the Goonee viewer/console are prefixed with `go-`.

This document describes the scope, mapping, and guidelines.

## Scope
- File: `console.js`
- Stylesheet: `go-style.css`
- Dynamic fallback inline CSS inside `console.js` also uses `.go-` selectors.

## Rationale
- Avoids collisions with host page styles/classes like `.console`, `.popup`, `.panel`.
- Easier to search/maintain; all Goonee UI starts with `go-`.
- Enables safe embedding via bookmarklets, extensions, or injected scripts.

## Class mapping (old → new)
- `matrix-bg` → `go-matrix-bg`
- `console-panel` → `go-console-panel`
- `console-header` → `go-console-header`
- `console-body` → `go-console-body`
- `toolbar` → `go-toolbar`
- `btn` → `go-btn`
- `main-content` → `go-main-content`
- `section-title` → `go-section-title`
- `code-input` → `go-code-input`
- `output` → `go-output`
- `status-bar` → `go-status-bar`
- `resize-handle` → `go-resize-handle`

Note: Utility element IDs like `#consolePanel`, `#consoleHeader`, `#resizeHandle`, and `#matrixCanvas` remain stable and are used by scripted behaviors. They are unique enough for our usage.

## Files updated
- `console.js`
  - All generated HTML now uses `go-` prefixed classes.
  - Fallback CSS (injected via `<style>`) updated to target `go-` classes.
  - External stylesheet loader now requests `go-style.css` (with cache-busting query), and also injects fallback CSS proactively to guarantee styling.
  - Removed unused constants to clear lint warnings.
- `go-style.css`
  - New stylesheet that defines the scoped `.go-` styles used by `console.js`.

## How styles are loaded
1. `console.js` attempts to load `go-style.css` from the same directory as `console.js`.
2. If the stylesheet fails to load (e.g., due to CSP or `file://`), a minimal fallback stylesheet is injected inline.
3. We also proactively inject fallback CSS to ensure predictable styling even if the external CSS loads slowly.

## Guidelines for future UI
- Use the `go-` prefix for any UI class names (e.g., `go-popup`, `go-panel`, `go-badge`).
- Avoid generic class names used by common frameworks.
- Keep IDs unique; reserve `go-`-prefixed IDs for future widgets.
- If adding new components in other files (e.g., `sharktool/tool.js`), follow the same `go-` prefix pattern.

## Migration notes
If a third-party or custom stylesheet targeted the old classes, update selectors accordingly:

```diff
- .console-panel .toolbar .btn { ... }
+ .go-console-panel .go-toolbar .go-btn { ... }
```

No public JavaScript APIs were renamed. User-facing functions like `toggleConsole()` are unchanged.
