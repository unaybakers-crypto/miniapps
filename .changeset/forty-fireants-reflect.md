---
"@farcaster/frame-wagmi-connector": patch
---

- improved isAuthorized
  - Updates isAuthorized to call eth_accounts to determine if the connector is
    authorized or not. If the frame provided wallet is connected this will return
    true, otherwise it should return false without triggering a prompt for the user
    to connect.
