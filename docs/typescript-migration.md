# TypeScript Migration Guide

## What was migrated

First-party runtime scripts are now authored in TypeScript:

- `src/ts/topbar-virtual.ts` (topbar layout behavior)
- `src/ts/minibar-virtual.ts` (minibar layout behavior)
- `src/ts/types/jquery-plugins.d.ts` (plugin/global typing support)

Build output target remains:

- `assets/js/topbar-virtual.js`
- `assets/js/minibar-virtual.js`

Third-party/minified vendor scripts are intentionally unchanged.

## Why vendor files were not migrated

These are external libraries and should stay as distributed artifacts:

- `assets/js/jquery-3.5.1.min.js`
- `assets/js/bootstrap.bundle.min.js`
- `assets/vendor/**/**/*.min.js`

Rewriting vendor files to TypeScript adds risk and no project-level value.

## Project layout

- `src/ts/`: TypeScript source of site behavior.
- `src/ts/types/`: ambient type declarations for jQuery plugins not covered by default typings.
- `assets/js/`: runtime JavaScript loaded by HTML.

## Build and type-check workflow

1. Install Node.js 18+ (or current LTS).
2. Install dependencies:
   - `npm install`
3. Build JS from TS:
   - `npm run build:ts`
4. Watch mode while editing:
   - `npm run watch:ts`
5. Type-check only:
   - `npm run check:ts`

## Existing environment note

In the current environment used for this migration, `node` is not installed. That means TS files are prepared, but JavaScript cannot be regenerated here until Node is available.

## Important runtime note

`index.html` referenced `../assets/js/google-maps.js`, but that file does not exist in this repo. This should be removed or replaced with an existing script to avoid browser 404 errors.

## Coding conventions used

- Strict TypeScript mode enabled (`"strict": true`).
- TSDoc comments added to all exported/shared behavior blocks.
- Null-safe DOM offset handling (`offset()?.top` checks).
- Explicit handling of plugin data values read from `data-*` attributes.

## Next improvements (optional)

- Consolidate duplicated behavior between `topbar-virtual.ts` and `minibar-virtual.ts` into shared utilities.
- Move from global jQuery plugin style to module-based architecture if you later adopt a bundler (Vite/Webpack).
- Add lightweight browser tests for nav scrolling and filter behavior.
