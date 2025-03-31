import { Channel, Util } from '@farcaster/frame-core'
import { EventEmitter } from 'eventemitter3'
import type { Compute } from './internal/types'

export type EventMap = {
  request: (payload: any) => void
  ethProviderRequest: (payload: any) => void
}

export type Emitter = Compute<EventEmitter<EventMap>>

export function createEmitter(): Emitter {
  const emitter = new EventEmitter<EventMap>()

  return {
    get eventNames() {
      return emitter.eventNames.bind(emitter)
    },
    get listenerCount() {
      return emitter.listenerCount.bind(emitter)
    },
    get listeners() {
      return emitter.listeners.bind(emitter)
    },
    addListener: emitter.addListener.bind(emitter),
    emit: emitter.emit.bind(emitter),
    off: emitter.off.bind(emitter),
    on: emitter.on.bind(emitter),
    once: emitter.once.bind(emitter),
    removeAllListeners: emitter.removeAllListeners.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
  }
}

export type HostChannel = {
  postResponse(response: any): void
  postEvent(event: string, params: any): void
  postEthProviderResponse(response: any): void
  postEthProviderEvent(event: any, params: any): void
} & Emitter

/**
 * An endpoint of communicating with an iFrame
 */
export function createChannel({
  endpoint,
  frameOrigin,
}: {
  endpoint: Channel.Endpoint
  frameOrigin: string
}): HostChannel {
  const emitter = createEmitter()

  endpoint.addEventListener('message', (event) => {
    if (event instanceof MessageEvent) {
      if (!Util.isAllowedOrigin([frameOrigin], event.origin)) {
        return
      }

      const { data } = event
      if (Channel.isMiniAppRequestMessage(data)) {
        emitter.emit('request', data.payload)
        return
      }

      if (Channel.isEthProviderRequestMessage(data)) {
        emitter.emit('ethProviderRequest', data.payload)
        return
      }
    }
  })

  return {
    ...emitter,
    postResponse(payload: any) {
      endpoint.postMessage({
        source: 'farcaster-host-response',
        payload,
      })
    },
    postEvent(event: string, params: any) {
      endpoint.postMessage({
        source: 'farcaster-host-event',
        payload: {
          event,
          params,
        },
      })

      // support for < 1.0 frame-sdk
      endpoint.postMessage({
        type: 'frameEvent',
        event,
        params,
      })
    },
    postEthProviderResponse(payload: any) {
      endpoint.postMessage({
        source: 'farcaster-eth-provider-response',
        payload,
      })
    },
    postEthProviderEvent(event: string, params: any) {
      endpoint.postMessage({
        source: 'farcaster-eth-provider-event',
        payload: {
          event,
          params,
        },
      })

      // support for < 1.0 frame-sdk
      endpoint.postMessage({
        type: 'frameEthProviderEvent',
        event,
        params,
      })
    },
  }
}
