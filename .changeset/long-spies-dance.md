---
"@farcaster/frame-host-react-native": patch
"@farcaster/frame-host": patch
"vanilla": patch
---

cleanup comlink exposures

vendors comlink so that we can modify expose to return a function
that will clean up the expose call
