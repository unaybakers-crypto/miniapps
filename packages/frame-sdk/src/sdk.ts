import {
  Add,
  AddFrame,
  type FrameClientEvent,
  JsonRpc,
  Provider,
  Ready,
  SignIn,
} from '@farcaster/frame-core'
import { channel } from './channel'
import * as EthProvider from './ethProvider'
import { frameHost } from './frameHost'
import type { FrameSDK } from './types'

const pendingRequestCallbacks: Record<string, (response: never) => void> = {}

const emitter = Provider.createEmitter()
const transport = JsonRpc.createTransport({
  async request(request) {
    return new Promise((resolve, reject) => {
      pendingRequestCallbacks[request.id] = (response) => {
        try {
          resolve(response)
        } catch (e) {
          reject(e)
        }
      }

      channel.postRequest(request)
    })
  },
})

function responseListener(response: JsonRpc.Response<never>) {
  const callback = pendingRequestCallbacks[response.id]
  if (callback) {
    delete pendingRequestCallbacks[response.id]
    return callback(response as never)
  }
}

channel.addListener('response', responseListener)

function eventListener(payload: FrameClientEvent) {
  if (payload.event === 'eip6963:announceProvider') {
    return
  }

  const { event, ...data } = payload
  emitter.emit(event, data as never)
  return
}

channel.addListener('event', eventListener)

export const sdk: FrameSDK = {
  ...emitter,
  get context() {
    return transport.request({ method: 'app_context' })
  },
  actions: {
    add() {
      return Add.add(transport)
    },
    async ready(options?: Ready.ready.Options) {
      return Ready.ready(transport, options ?? {})
    },
    setPrimaryButton: frameHost.setPrimaryButton.bind(frameHost),
    close: frameHost.close.bind(frameHost),
    viewProfile: frameHost.viewProfile.bind(frameHost),
    viewToken: frameHost.viewToken.bind(frameHost),
    swap: frameHost.swap.bind(frameHost),
    signIn: async (options) => {
      const response = await frameHost.signIn(options)
      if (response.result) {
        return response.result
      }

      if (response.error.type === 'rejected_by_user') {
        throw new SignIn.RejectedByUser()
      }

      throw new Error('Unreachable')
    },
    openUrl: (url: string) => {
      return frameHost.openUrl(url.trim())
    },
    addFrame: async () => {
      const response = await frameHost.addFrame()
      if (response.result) {
        return response.result
      }

      if (response.error.type === 'invalid_domain_manifest') {
        throw new AddFrame.InvalidDomainManifest()
      }

      if (response.error.type === 'rejected_by_user') {
        throw new AddFrame.RejectedByUser()
      }

      throw new Error('Unreachable')
    },
  },
  wallet: {
    ethProvider: EthProvider.provider,
  },
}
