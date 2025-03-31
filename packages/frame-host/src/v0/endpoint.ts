import type { FrameHost } from '@farcaster/frame-core'
import type { Provider as EthProvider } from 'ox'
import { useEffect } from 'react'
import * as Comlink from './comlink'
import { wrapProviderRequest } from './provider'
import { wrapHandlers } from './sdk'

/**
 * @returns function to cleanup provider listeners
 */
export function exposeToEndpoint({
  endpoint,
  sdk,
  frameOrigin,
  ethProvider,
  debug = false,
}: {
  endpoint: Comlink.Endpoint
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>
  frameOrigin: string
  ethProvider?: EthProvider.Provider
  debug?: boolean
}) {
  const extendedSdk = wrapHandlers(sdk as FrameHost)

  if (ethProvider) {
    extendedSdk.ethProviderRequestV2 = wrapProviderRequest({
      provider: ethProvider,
      debug,
    })
  }

  return Comlink.expose(extendedSdk, endpoint, [frameOrigin])
}

export function useExposeToEndpoint({
  endpoint,
  sdk,
  frameOrigin,
  ethProvider,
  debug = false,
}: {
  endpoint: Comlink.Endpoint | undefined
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>
  frameOrigin: string
  ethProvider?: EthProvider.Provider
  debug?: boolean
}) {
  useEffect(() => {
    if (!endpoint) {
      return
    }

    const cleanup = exposeToEndpoint({
      endpoint,
      sdk,
      frameOrigin,
      ethProvider,
      debug,
    })

    return cleanup
  }, [endpoint, sdk, ethProvider, frameOrigin, debug])
}
