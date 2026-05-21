# Fix: Drawer/Sheet Content Cutoff in TemplateDetailSheet

## Root Cause Analysis

The scrollable body inside `TemplateDetailSheet` is getting cut off because the `DrawerContent` (mobile) and `SheetContent` (desktop) containers do not establish a proper **fixed-height flex column** that the inner `ScrollArea` can grow into. Specifically:

### Mobile — `DrawerContent` (vaul)
The `DrawerContent` base styles from `drawer.tsx` use:
```
flex h-auto flex-col
```
and for bottom drawers:
```
max-h-[80vh]
```
The component overrides this with `max-h-full flex flex-col p-0 h-full overflow-hidden`, but vaul's own `h-auto` and `max-h-[80vh]` from the base class win because they are applied at the `DrawerPrimitive.Content` level and cannot be fully overridden with just className on the wrapper. The result: the drawer only grows to fit its content, clipping the `ScrollArea`.

### Desktop — `SheetContent` (Radix Dialog)
`SheetContent` applies `h-full` via the `side === "right"` variant, and the component passes `flex flex-col p-0 h-full overflow-hidden`. This should work, but the `SheetContent` base class also includes `gap-4` on the flex container. Since the colored header `div` and the `ScrollArea` are **not** direct children of `SheetContent` (they are children of a `<>` React fragment), the flex layout does not directly apply to them — the fragment renders them as siblings inside the content but the flex chain is broken because there is no wrapper div establishing `flex flex-col h-full` over those siblings.

### Summary of Issues
| Location | Problem |
|---|---|
| `DrawerContent` className | Vaul's base `h-auto` overrides `h-full`; needs `max-h-[calc(100svh-2rem)]` or similar and the inner layout must be `flex flex-col overflow-hidden` |
| `SheetContent` children | Fragment `<>` breaks the direct-child flex layout; needs an explicit wrapper `div` with `flex flex-col flex-1 min-h-0 overflow-hidden` |
| `ScrollArea` | Has `flex-1 min-h-0 h-full` — correct intent, but ineffective when the parent flex chain is broken |

---

## Proposed Changes

Only **one file** needs to be changed.

---

### [MODIFY] [TemplateDetailSheet.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplateDetailSheet.tsx)

#### Change 1 — Wrap `Content` in a proper flex container

Replace the bare React fragment `<>...</>` that defines `Content` with a `<div>` that explicitly establishes the full-height flex column, so both the fixed colored header and the scrollable body are direct flex children of a container with bounded height.

**Before (line 75–280):**
```tsx
const Content = (
    <>
        {/* Coloured header */}
        <div className="bg-gradient-to-br from-indigo-50 ... flex-shrink-0">
            ...
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0 h-full">
            ...
        </ScrollArea>
    </>
);
```

**After:**
```tsx
const Content = (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Coloured header */}
        <div className="bg-gradient-to-br from-indigo-50 ... flex-shrink-0">
            ...
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0">
            ...
        </ScrollArea>
    </div>
);
```

> **Why this works:** The outer `div` becomes the actual flex child of both `SheetContent` and `DrawerContent`. With `flex flex-col flex-1 min-h-0`, it correctly takes up remaining space while allowing its own children to use flex growth/shrink. The `ScrollArea` then has a properly bounded parent and can scroll.

---

#### Change 2 — Fix `DrawerContent` height on mobile

The vaul `DrawerContent` uses `h-auto` and `max-h-[80vh]` by default for bottom drawers. The current override `max-h-full h-full` does not reliably override vaul's inline style/data attribute constraints on mobile.

**Before (line 285):**
```tsx
<DrawerContent className="max-h-full flex flex-col p-0 h-full overflow-hidden">
```

**After:**
```tsx
<DrawerContent className="flex flex-col p-0 overflow-hidden" style={{ maxHeight: '100svh' }}>
```

> **Why:** Using an inline `style` for `maxHeight` guarantees it wins over Tailwind's generated classes. `100svh` uses the small viewport height unit which correctly handles mobile browser chrome (address bars). Removing `h-full` avoids conflicting with vaul's own height management; vaul positions the drawer correctly — we only need to cap its max height and ensure the flex layout is in place.

---

#### Change 3 — Fix `SheetContent` to ensure `flex flex-col h-full` (no gap)

The `SheetContent` base class applies `gap-4` to its flex container. This creates unexpected gaps. The `p-0` is already passed. Add `gap-0` to neutralize the base gap.

**Before (line 298):**
```tsx
<SheetContent className="w-full sm:max-w-xl flex flex-col p-0 h-full overflow-hidden">
```

**After:**
```tsx
<SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0 h-full overflow-hidden">
```

---

## Complete Diff

```diff
- const Content = (
-     <>
-         {/* Coloured header */}
-         <div className="bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-950 dark:to-violet-900 p-6 flex-shrink-0">
+ const Content = (
+     <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
+         {/* Coloured header */}
+         <div className="bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-950 dark:to-violet-900 p-6 flex-shrink-0">
              ...
          </div>

-         {/* Scrollable body */}
-         <ScrollArea className="flex-1 min-h-0 h-full">
+         {/* Scrollable body */}
+         <ScrollArea className="flex-1 min-h-0">
              ...
          </ScrollArea>
-     </>
- );
+     </div>
+ );

  if (isMobile) {
      return (
          <Drawer open={open} onOpenChange={onOpenChange}>
-             <DrawerContent className="max-h-full flex flex-col p-0 h-full overflow-hidden">
+             <DrawerContent className="flex flex-col p-0 overflow-hidden" style={{ maxHeight: '100svh' }}>
                  <DrawerHeader className="sr-only">
                      ...

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
-         <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 h-full overflow-hidden">
+         <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0 h-full overflow-hidden">
              <SheetHeader className="sr-only">
```

---

## Verification Plan

### Visual Verification
1. Open the app in a browser (desktop viewport).
2. Click any template row to open the `TemplateDetailSheet`.
3. Verify the sheet fills the full viewport height and the body scrolls smoothly past the colored header.
4. Resize to a mobile viewport (< 768px) and repeat — the drawer should fill the screen height and the body should be scrollable without content cutoff.

### Edge Cases to Check
- Template with many instruction steps → all steps visible via scroll
- Template with a video embed → video renders within the scroll area
- Template with no optional sections → no layout gaps

### No Automated Tests Required
This is a pure CSS/layout fix with no logic changes.

---

## Open Questions

None — root cause is unambiguous. The fix is safe: no API calls, no state changes, no type changes. Only className and wrapper element changes.
