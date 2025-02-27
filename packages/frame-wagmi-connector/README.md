# Frame Wagmi Connector

A [Wagmi connector](https://wagmi.sh/) for interacting with wallets in Farcaster Frames.


## Install

[Install and setup wagmi](https://wagmi.sh/react/getting-started#manual-installation).

Install the connector:

```
npm install wagmi @farcaster/frame-wagmi-connector
```

## Usage

Connect to users wallet:

```
import { useConnect } from 'wagmi'
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

function App() {
  const { connect } = useConnect()

  return (
    <button onClick={() => connect({ connector: farcasterFrame() })}>
      Connect
    </button>
  )
}
```

You can now interact with the users connected wallet via Wagmi.
