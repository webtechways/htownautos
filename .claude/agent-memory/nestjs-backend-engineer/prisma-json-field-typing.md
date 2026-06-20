---
name: prisma-json-field-typing
description: How to pass plain JS objects into Prisma Json columns without TS errors
metadata:
  type: feedback
---

When assigning a `Record<string, unknown>` (or `any` object) to a Prisma `Json` field in `create`/`update`/`upsert`, TypeScript will error because Prisma expects `Prisma.InputJsonValue`, not a plain object type.

**Fix:**

```ts
const jsonData = data as unknown as Prisma.InputJsonValue;
await prisma.model.create({ data: { jsonField: jsonData } });
```

**Why:** Prisma's generated types for `Json` fields use a branded `InputJsonValue` that doesn't accept `Record<string, unknown>` directly, even though at runtime it is valid JSON. The double cast (`as unknown as`) is the idiomatic workaround.

**How to apply:** Any time you pass a typed object literal or function parameter into a `Json` Prisma field — always cast it. Add `import { Prisma } from '@prisma/client'` if not already imported.
