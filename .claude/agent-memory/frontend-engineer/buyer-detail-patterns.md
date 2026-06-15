---
name: buyer-detail-patterns
description: How the buyer detail page (customers/edit.tsx) wires tabs, sub-tabs, and hash routing
metadata:
  type: project
---

The buyer detail page (`src/pages/customers/edit.tsx`) has two levels of tabs:

**Top-level tabs:** Lead, Payments, Credit App, For Bids, Vehicle, Deals, Files, Compliance, Journal, Logs.
Stored in `activeTab` state. Defined in `MAIN_TABS` const.

**Sub-tab groups:**
- `lead` → leadSubTab: phone | sms | email | appt | task | note | ai-insight
- `for-bids` → forBidsSubTab: wanted | matches | favorites | inspections

Hash routing: `SUB_TAB_HASH` maps internal sub-tab value → URL hash fragment.
`HASH_TO_SUB_TAB` is the reverse. `parseTabHash` / `buildTabHash` handle encode/decode.

To add a new sub-tab under "For Bids":
1. Add entry to `SUB_TAB_HASH["for-bids"]`
2. Add `TabsTrigger` + `TabsContent` inside the `for-bids` TabsContent block
3. Import the component and render it inside the new TabsContent
4. Add the import for any new lucide icon used

All sub-tab components receive at minimum `{ buyerId: string }`.

**Why:** The hash routing lets staff copy/paste deep links directly to a customer's specific tab.

**How to apply:** Follow exactly this pattern when adding new sub-tabs. Don't add new top-level tabs unless the feature doesn't belong in an existing group.
