import type { EthProviderWireEvent } from '@farcaster/frame-core'
import type {
  AnnounceProviderParameters,
  AnnounceProviderReturnType,
  EIP1193Provider,
  EIP6963ProviderDetail,
} from 'mipd'
import { Provider, RpcRequest, RpcResponse } from 'ox'
import { channel } from './channel'
import { frameHost } from './frameHost'

const store = RpcRequest.createStore()
const emitter = Provider.createEmitter()

const pendingRequestCallbacks: Record<string, (response: never) => void> = {}

export const provider: Provider.Provider = Provider.from({
  ...emitter,
  async request(parameters) {
    return new Promise((resolve, reject) => {
      const request = store.prepare(parameters as never)

      pendingRequestCallbacks[request.id] = (
        response: RpcResponse.RpcResponse,
      ) => {
        try {
          resolve(
            // @ts-expect-error
            RpcResponse.parse(response, {
              request,
            }),
          )
        } catch (error) {
          reject(Provider.parseError(error))
        }
      }

      channel.postEthProviderRequest(request)
    })
  },
})

function responseListener(response: RpcResponse.RpcResponse) {
  const callback = pendingRequestCallbacks[response.id]
  if (callback) {
    delete pendingRequestCallbacks[response.id]
    return callback(response as never)
  }
}

channel.addListener('ethProviderResponse', responseListener)

function eventListener({ event, params }: EthProviderWireEvent) {
  emitter.emit(event, ...(params as never))
  return
}

channel.addListener('ethProviderEvent', eventListener)

export function announceProvider(
  detail: AnnounceProviderParameters,
): AnnounceProviderReturnType {
  const event: CustomEvent<EIP6963ProviderDetail> = new CustomEvent(
    'eip6963:announceProvider',
    { detail: Object.freeze(detail) },
  )

  function handler() {
    window.dispatchEvent(event)
  }

  // should announcing happen on document?
  window.dispatchEvent(event)
  window.addEventListener('eip6963:requestProvider', handler)

  return () => {
    window.removeEventListener('eip6963:requestProvider', handler)
  }
}

channel.addListener('event', (payload) => {
  if (payload.event === 'eip6963:announceProvider') {
    announceProvider({
      info: payload.info,
      provider: provider as EIP1193Provider,
    })
  }
})

// Required to pass SSR
if (typeof document !== 'undefined') {
  // forward eip6963:requestProvider events to the host
  document.addEventListener('eip6963:requestProvider', () => {
    // TODO in v1
    frameHost.eip6963RequestProvider()
  })
}

// Required to pass SSR
if (typeof window !== 'undefined') {
  // forward eip6963:requestProvider events to the host
  window.addEventListener('eip6963:requestProvider', () => {
    // TODO in v1
    frameHost.eip6963RequestProvider()
  })
}
