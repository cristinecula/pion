---
'@pionjs/pion': patch
---

Observed attributes whose camelCase name collides with an inherited accessor (native reflections like `aria-*` or `title`, or base-class accessors) now schedule a re-render. The renderer can read the new value from either the attribute or the camelCase property. Values pass through verbatim — no boolean coercion on these attributes.
