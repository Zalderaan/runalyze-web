# Bug: Template Instruction Updates Don't Propagate to Linked Drills

## Background

The app uses a **template/assignment architecture**:

- `drill_templates` — shared, canonical rows (name, instructions, justification, reference, video_url)
- `drills` — per-context assignment rows that reference a `template_id`, with optional `instructions_override` / `justification_override` columns to shadow the template

When the Drills API (`GET /api/admin/drills`) returns data, a `mergeDrillWithTemplate` helper resolves the effective `instructions` as:

```
instructions_override  →  tpl.instructions  →  drill.instructions  (legacy)
```

So the **source of truth for instructions is the template**. This design is correct — updating the template **should** automatically cascade to all linked drills that have no override set.

---

## Root Cause Analysis

### The actual bug: stale in-memory state, not the database

After tracing the full data flow, the database update **works correctly**:

1. `EditTemplateDialog` → `useUpdateDrillTemplate` → `PUT /api/admin/drill-templates/[id]`
2. The API writes the new `instructions` to `drill_templates`.
3. The next `GET /api/admin/drills` will return the updated value via `mergeDrillWithTemplate`.

**The linked drills appear stale because their in-memory state is never refreshed.** Specifically:

### Bug 1 — `TemplateDetailSheet`: assignments panel not re-fetched after template edit

In [`TemplateDetailSheet.tsx`](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplateDetailSheet.tsx):

```tsx
// Line 107
<EditTemplateDialog template={template} onSuccess={onTemplateUpdated} />
```

`onTemplateUpdated` is wired in [`TemplatesList.tsx`](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplatesList.tsx) to:

```tsx
onTemplateUpdated={() => {
    refetch();          // Refreshes the template card list ✅
    setSheetOpen(false); // Closes the sheet ✅
}}
```

**Problem:** After the sheet closes and you re-open it, `fetchAssignments()` is called because `open` changes. However:

- The `template` prop passed to `TemplateDetailSheet` is from the stale `templates` array in `useDrillTemplates` state.
- `refetch()` is called but `TemplatesList` sets `sheetOpen(false)` **at the same time**. The sheet re-opens with the **old** `selected` state (the outdated `DrillTemplate` object from before the edit), because `setSelected` is never updated with the freshly-fetched template data.
- The instructions displayed in the sheet header (`template.instructions?.steps`) still show the old value until you click a different card and come back.

### Bug 2 — `DrillsList` / `DrillsCard` in the "Drills" tab: no refresh triggered

The `DrillsList` component uses `useDrills` which only re-fetches when `refreshKey`, `page`, `searchTerm`, `area`, or `performanceLevel` change. Editing a template through `EditTemplateDialog` **never bumps `refreshKey`** in the Drills tab, so the Drills tab continues showing stale resolved instructions until the page is reloaded.

### Bug 3 (Secondary) — `EditDrillDialog` opened from inside `TemplateDetailSheet`

When a user opens `EditDrillDialog` for a linked assignment from inside `TemplateDetailSheet`, the `drill` prop is built from the now-stale `assignments` state. The pre-filled `instructions` field in Step 3 shows the old template instructions, even though the template DB row was already updated.

---

## Proposed Changes

### Component 1: `TemplatesList.tsx`

#### [MODIFY] [TemplatesList.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplatesList.tsx)

Update `onTemplateUpdated` to also update `selected` with the freshly-fetched template data, so that when the sheet re-opens it shows the updated template.

```tsx
// Current
onTemplateUpdated={() => {
    refetch();
    setSheetOpen(false);
}}

// Fix: After refetch(), find the updated template in the new list and update `selected`
onTemplateUpdated={async () => {
    await refetch();
    // selected.id is still valid — find the updated template after the refetch
    // refetch() updates `templates` state; we need the new version of `selected`
    setSheetOpen(false);
    // Clear selected so reopening forces a fresh selection (avoids stale instructions in sheet header)
    setSelected(null);
}}
```

> [!NOTE]
> Simply setting `selected(null)` after `refetch()` is the safest approach. When the user re-clicks the template card, they'll see the freshly-fetched data. An even better UX would be to pass the updated template back from `onSuccess`, but that requires plumbing the API response up from `useUpdateDrillTemplate` → `EditTemplateDialog` → `TemplateDetailSheet` → `TemplatesList`.

**Better fix (recommended):** pipe the updated template object back from `EditTemplateDialog.onSuccess` so `selected` can be updated without closing the sheet.

---

### Component 2: `EditTemplateDialog.tsx`

#### [MODIFY] [EditTemplateDialog.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/EditTemplateDialog.tsx)

Change `onSuccess` signature to receive the updated template from the API response, so parent components can refresh their local state without closing the sheet.

```tsx
// Before
export function EditTemplateDialog({ template, onSuccess }: {
    template: DrillTemplate,
    onSuccess?: () => void
})

// After
export function EditTemplateDialog({ template, onSuccess }: {
    template: DrillTemplate,
    onSuccess?: (updatedTemplate: DrillTemplate) => void  // ← pass updated data up
})
```

In `onStepSubmit`, when the update succeeds, extract the returned template from the API and pass it to `onSuccess`:

```tsx
// In the final step handler:
const result = await updateTemplate(formPayload, template.id);
// result.template is the updated drill_templates row from the PUT API
onSuccess?.(result.template);
```

---

### Component 3: `TemplateDetailSheet.tsx`

#### [MODIFY] [TemplateDetailSheet.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplateDetailSheet.tsx)

1. Accept the updated template from `EditTemplateDialog.onSuccess` and immediately call `onTemplateUpdated` with it.
2. Re-fetch `assignments` after the template is updated (instructions may have changed; overrides need to be visible with fresh context).

```tsx
<EditTemplateDialog
    template={template}
    onSuccess={(updatedTemplate) => {
        fetchAssignments();           // Re-fetch linked drills so they show updated instructions
        onTemplateUpdated?.(updatedTemplate);  // Bubble up to TemplatesList
    }}
/>
```

The `onTemplateUpdated` callback type in `TemplateDetailSheetProps` needs updating to match:

```tsx
// Before
onTemplateUpdated?: () => void;

// After
onTemplateUpdated?: (updatedTemplate?: DrillTemplate) => void;
```

---

### Component 4: `TemplatesList.tsx` (revisited)

#### [MODIFY] [TemplatesList.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplatesList.tsx)

Update `onTemplateUpdated` to accept the fresh template object and update `selected` in-place, so the sheet stays open with live data:

```tsx
onTemplateUpdated={(updatedTemplate) => {
    refetch();   // Update the template card grid
    if (updatedTemplate) {
        setSelected(updatedTemplate);  // Update sheet header in-place ← key fix
    }
    // Do NOT close the sheet — let the user see the updated data immediately
}}
```

---

### Component 5: `use-update-drill-template.ts`

#### [MODIFY] [use-update-drill-template.ts](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/hooks/drills/use-update-drill-template.ts)

Ensure `updateTemplate` returns the full API response data (it already does via `return data`), so callers can extract `result.template`. No functional change needed here — just verify that callers destructure `result.template` correctly.

---

### Component 6 (Optional / Drills tab): Backend Python cache clear on template update

#### [MODIFY] [use-update-drill-template.ts](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/hooks/drills/use-update-drill-template.ts)

The `useUpdateDrill` hook clears the Python backend cache after every update. `useUpdateDrillTemplate` does not. Since a template update changes the resolved `instructions` for all linked drills (which the Python backend may serve), add a cache clear call in the `finally` block:

```tsx
} finally {
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (BACKEND_URL) {
            await fetch(`${BACKEND_URL}/drills/clear-cache/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (cacheError) {
        console.error("Failed to clear backend cache after template update:", cacheError);
    }
    setUpdateLoading(false);
}
```

---

## Data Flow After Fix

```
User edits template in EditTemplateDialog
    ↓
PUT /api/admin/drill-templates/[id]  (writes to drill_templates table)
    ↓  returns { template: updatedTemplateRow }
useUpdateDrillTemplate.updateTemplate() returns result
    ↓
EditTemplateDialog.onStepSubmit calls onSuccess(result.template)
    ↓
TemplateDetailSheet receives updatedTemplate
    ├─ fetchAssignments()  →  GET /api/admin/drills?template_id=X  (fresh, shows new instructions)
    └─ onTemplateUpdated(updatedTemplate)
           ↓
       TemplatesList
           ├─ refetch()          (template card grid shows new name/counts)
           └─ setSelected(updatedTemplate)  (sheet header shows new instructions immediately)
```

---

## Files Changed

| File | Change |
|------|--------|
| [EditTemplateDialog.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/EditTemplateDialog.tsx) | Change `onSuccess` to pass `updatedTemplate` up; extract `result.template` from `updateTemplate()` return |
| [TemplateDetailSheet.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplateDetailSheet.tsx) | Update `onTemplateUpdated` prop type; call `fetchAssignments()` inside `EditTemplateDialog.onSuccess`; bubble updated template up |
| [TemplatesList.tsx](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/components/admin/TemplatesList.tsx) | Accept `updatedTemplate` in `onTemplateUpdated`; call `setSelected(updatedTemplate)` to refresh sheet in-place |
| [use-update-drill-template.ts](file:///c:/Users/godfr/Desktop/sideproj/run-analysis/runalyze/hooks/drills/use-update-drill-template.ts) | (Optional) Add Python backend cache clear in `finally` block |

> [!NOTE]
> No database schema changes. No API route changes. No changes to `EditDrillDialog`, `AddDrillDialog`, `DrillsList`, or schemas. The `mergeDrillWithTemplate` logic in the GET routes is already correct — the bug is purely a stale in-memory state problem on the frontend.

---

## What Does NOT Need Changing

| Item | Why |
|------|-----|
| `PUT /api/admin/drill-templates/[id]` | Already writes `instructions` to `drill_templates` correctly. Also syncs `drill_name` to linked `drills` rows for legacy compat. |
| `GET /api/admin/drills` | `mergeDrillWithTemplate` already resolves `instructions` from template — so the DB read is correct. |
| `EditDrillDialog` | No change — template scope updates already go through `PUT /api/admin/drills/[id]` which writes to the template table. |
| `drillFormSchemas.ts` | No change needed. |

---

## Verification Plan

### Automated
- None currently in place; verify manually.

### Manual Steps

1. **Open the Templates tab**, click a template card → sheet opens showing current instructions.
2. **Click "Edit Template"**, advance to Step 2 (Instructions), add/change a step, and click "Save Template".
3. **Expected:** The sheet stays open (or re-opens) and the Instructions section immediately shows the updated steps — without a page reload.
4. **Re-open the sheet** by clicking the same template card again — instructions should still show the updated value (confirming `selected` was updated in `TemplatesList`).
5. **Click any linked drill assignment** in the sheet → open `EditDrillDialog` → navigate to Step 3 → confirm the pre-filled instructions match the newly updated template value.
6. **Switch to the Drills tab** → find a linked drill card → open it → instructions should reflect the template update (may require a manual page refresh if the Drills tab `refreshKey` hasn't changed — this is a known separate concern).
7. **Confirm no regressions**: editing a drill with `update_scope = 'assignment'` should still store `instructions_override` and not touch the template.
