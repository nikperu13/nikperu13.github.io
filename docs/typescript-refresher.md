# TypeScript Refresher (vs JavaScript)

## Mental model

- JavaScript: dynamic at runtime, no built-in compile-time type checks.
- TypeScript: JavaScript + static type system + compiler.

TS does not replace JS runtime behavior; it checks your code before it runs.

## Key differences that matter most

### 1) Type annotations

```ts
const count: number = 3;
const name: string = "Nico";
```

You can also rely on inference:

```ts
const count = 3; // inferred as number
```

### 2) Function contracts

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

TS catches invalid calls before runtime.

### 3) Interfaces / type aliases

```ts
interface User {
  id: string;
  role: "admin" | "member";
}
```

Great for API responses, config objects, and plugin options.

### 4) Null/undefined safety

With strict mode, you must handle possibly missing values:

```ts
const top = $(target).offset()?.top;
if (typeof top === "number") {
  // safe usage
}
```

### 5) Better editor tooling

Autocomplete, refactor safety, jump-to-definition, and early error detection improve significantly.

## Important TS concepts to know

- `any`: turns off type safety for a value (use sparingly).
- `unknown`: safer than `any`; requires narrowing before use.
- Union types: `string | number`.
- Literal types: `"up" | "down"`.
- Type narrowing: runtime checks that refine compile-time types.
- Declaration files (`.d.ts`): add typings for external globals/plugins.

## What TS does not do

- It does not run in browsers directly (without a build pipeline).
- It does not automatically fix runtime logic bugs.
- It does not replace tests.

## Common migration strategy

1. Add TS build config (`tsconfig.json`).
2. Move source files from `.js` to `.ts`.
3. Add typings for external libs/plugins.
4. Compile TS back to JS for browser runtime.
5. Turn on stricter checks gradually.

## Practical tips for this project

- Keep vendor scripts in plain JS.
- Keep your own behavior in `src/ts/*`.
- Rebuild after TS changes before testing in browser.
- If plugin typings are missing, add them in `src/ts/types/jquery-plugins.d.ts`.
