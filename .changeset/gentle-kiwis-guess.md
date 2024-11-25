---
"@farcaster/frame-sdk": patch
---

Fixed an `window` is not defined issue that happened when during SSR `window` (and `document`) have been attempted to be accessed.
