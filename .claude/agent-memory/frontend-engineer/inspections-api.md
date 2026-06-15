---
name: inspections-api
description: VehicleInspection type, STATUS_META colors, and how to use inspectionsApi.list() with buyerId
metadata:
  type: project
---

API client: `src/pages/dashboard/inspection/api.ts`

**Key exports:**
- `inspectionsApi.list({ buyerId?, vehicleId?, status?, vin?, lotNumber?, page?, limit? })` → `ListInspectionsResponse { data: VehicleInspection[], meta }`
- `inspectionsApi.get(id)` → `VehicleInspection`
- `STATUS_META: Record<InspectionStatus, { label: string; color: string }>` — color is a Tailwind string for Badge variant="outline"
- `qualityMeta(q: 1|2|3|null)` → `{ label, color (dot bg), tone (text color) }`

**VehicleInspection key fields:** id, vin, lotNumber, yardName, yardNumber, vehicleId, buyerId, status, requestedAt, inspectedAt, completedAt, overallRating (number|null), marketPrice (string|null), media, checklist, requestItems, sharedWith.

**Inspection detail route:** `/dashboard/inspection/:id` (confirmed in router.tsx line 183)

**Status values:** REQUESTED | IN_PROGRESS | DONE | REJECTED | CANCELED

**How to apply:** Always import STATUS_META from this file for badge colors. Use `inspectionsApi.list({ buyerId })` with `limit: 100` for buyer-scoped lists (no pagination UI needed unless buyer has >100 inspections).
