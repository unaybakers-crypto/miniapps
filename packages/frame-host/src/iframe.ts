import type { Channel, FrameHost } from '@farcaster/frame-core'
import type { Provider } from 'ox'
import { exposeProvider } from './appProvider'
import { createChannel } from './channel'
import { exposeProvider as exposeEthProvider } from './ethProvider'
import { fromHost } from './host'
import { exposeToEndpoint } from './v0/endpoint'
import { wrapProviderRequest } from './v0/provider'
import { wrapHandlers } from './v0/sdk'

/**
 * An endpoint of communicating with an iFrame
 */
export function createIframeEndpoint({
  iframe,
  targetOrigin,
}: {
  iframe: HTMLIFrameElement
  targetOrigin: string
}): Channel.Endpoint {
  return {
    postMessage: (msg: unknown) => {
      iframe.contentWindow?.postMessage(msg, targetOrigin)
    },
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
  }
}

export function exposeToIframe({
  iframe,
  sdk,
  ethProvider,
  frameOrigin,
  debug = false,
}: {
  iframe: HTMLIFrameElement
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>
  frameOrigin: string
  ethProvider?: Provider.Provider
  debug?: boolean
}) {
  const endpoint = createIframeEndpoint({
    iframe,
    targetOrigin: frameOrigin,
  })

  // support for < 1.0 frame-sdk
  const comlinkCleanup = exposeToEndpoint({
    endpoint,
    sdk,
    ethProvider,
    frameOrigin,
    debug,
  })

  // support for < 1.0 frame-sdk
  const extendedSdk = wrapHandlers(sdk as FrameHost)
  if (ethProvider) {
    extendedSdk.ethProviderRequestV2 = wrapProviderRequest({
      provider: ethProvider,
      debug,
    })
  }

  const channel = createChannel({ endpoint, frameOrigin })
  const unexposeEthProvider = (() => {
    if (ethProvider) {
      return exposeEthProvider({
        channel,
        provider: ethProvider,
      })
    }
  })()

  // adapt from 1.0 frame-sdk, might be a better way to do this
  const frameProvider = fromHost({
    host: extendedSdk,
  })

  const unexposeProvider = exposeProvider({
    channel,
    frameProvider,
  })

  return {
    endpoint,
    cleanup: () => {
      unexposeProvider()
      unexposeEthProvider?.()
      comlinkCleanup()
    },
  }
}
