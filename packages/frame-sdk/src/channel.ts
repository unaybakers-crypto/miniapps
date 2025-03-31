import {
  Channel,
  type EthProviderWireEvent,
  type FrameClientEvent,
  Util,
} from '@farcaster/frame-core'
import { EventEmitter } from 'eventemitter3'
import type { RpcResponse } from 'ox'
import { endpoint } from './endpoint'
import type { Compute } from './internal/types'

export type EventMap = {
  response: (payload: any) => void
  event: (payload: FrameClientEvent) => void
  ethProviderResponse: (payload: RpcResponse.RpcResponse) => void
  ethProviderEvent: (payload: EthProviderWireEvent) => void
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

export type AppChannel = {
  postRequest(response: any): void
  postEthProviderRequest(response: any): void
} & Emitter

export function createChannel({
  endpoint,
  frameOrigin,
}: {
  endpoint: Channel.Endpoint
  frameOrigin: string
}): AppChannel {
  const emitter = createEmitter()

  endpoint.addEventListener('message', (event) => {
    if (event instanceof MessageEvent) {
      if (!Util.isAllowedOrigin([frameOrigin], event.origin)) {
        return
      }

      const { data } = event
      if (Channel.isHostResponseMessage(data)) {
        emitter.emit('response', data.payload)
        return
      }

      if (Channel.isHostEventMessage(data)) {
        emitter.emit('event', data.payload)
        return
      }

      if (Channel.isEthProviderResponseMessage(data)) {
        emitter.emit('ethProviderResponse', data.payload)
        return
      }

      if (Channel.isEthProviderEventMessage(data)) {
        emitter.emit('ethProviderEvent', data.payload)
        return
      }
    }
  })

  return {
    ...emitter,
    postRequest(payload: any) {
      endpoint.postMessage({
        source: 'farcaster-mini-app-request',
        payload,
      })
    },
    postEthProviderRequest(payload: any) {
      endpoint.postMessage({
        source: 'farcaster-eth-provider-request',
        payload,
      })
    },
  }
}

export const channel = createChannel({
  endpoint,
  frameOrigin: '*',
})
