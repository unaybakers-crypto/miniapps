import { type JsonRpc, Provider } from '@farcaster/frame-core'
import { RpcResponse } from 'ox'
import type { HostChannel } from './channel'

const farcasterHostEventTypes = [
  'frameAdded',
  'frameAddRejected',
  'frameRemoved',
  'notificationsEnabled',
  'notificationsDisabled',
] as const

export function exposeProvider({
  channel,
  frameProvider,
}: {
  channel: HostChannel
  frameProvider: Provider.Provider
}) {
  async function listener(request: JsonRpc.Request) {
    const result = await (async () => {
      try {
        const result = await frameProvider.request(request)

        return {
          id: request.id,
          jsonrpc: request.jsonrpc,
          result,
        }
      } catch (e) {
        if (e instanceof RpcResponse.BaseError) {
          return {
            id: request.id,
            jsonrpc: request.jsonrpc,
            error: {
              code: e.code,
              message: e.message,
              data: e.data,
            },
          }
        }

        if (e instanceof Provider.ProviderRpcError) {
          return {
            id: request.id,
            jsonrpc: request.jsonrpc,
            error: {
              code: e.code,
              message: e.message,
            },
          }
        }

        return {
          id: request.id,
          jsonrpc: request.jsonrpc,
          error: {
            code: RpcResponse.InternalError.code,
            message: `Internal error: ${e}`,
          },
        }
      }
    })()

    channel.postResponse(result)
  }

  channel.on('request', listener)

  const removeListeners = farcasterHostEventTypes.map((event) => {
    function handleEvent(params: any) {
      channel.postEvent(event, params)
    }

    frameProvider.on(event, handleEvent)

    return () => {
      frameProvider.removeListener(event, handleEvent)
    }
  })

  return () => {
    channel.off('ethProviderRequest', listener)

    for (const removeListener of removeListeners) {
      removeListener()
    }
  }
}
