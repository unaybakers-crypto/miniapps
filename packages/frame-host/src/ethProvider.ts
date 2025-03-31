import { Provider, RpcResponse } from 'ox'
import type { HostChannel } from './channel'

export function exposeProvider({
  channel,
  provider: externalProvider,
}: {
  channel: HostChannel
  provider: any
}) {
  const provider = Provider.from(externalProvider)

  async function listener(request: any) {
    const result = await (async () => {
      try {
        // it's important to understand that this isn't a raw provider
        const result = await provider.request(request)

        return {
          id: request.id,
          jsonrpc: request.jsonrpc,
          result,
        }
      } catch (e) {
        if (
          e instanceof RpcResponse.BaseError ||
          e instanceof Provider.ProviderRpcError
        ) {
          return {
            id: request.id,
            jsonrpc: request.jsonrpc,
            error: {
              code: e.code,
              message: e.message,
              data: 'data' in e ? e.data : undefined,
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

    channel.postEthProviderResponse(result)
  }

  const accountsChanged: Provider.EventMap['accountsChanged'] = (accounts) => {
    channel.postEthProviderEvent('accountsChanged', [accounts])
  }
  const chainChanged: Provider.EventMap['chainChanged'] = (chainId) => {
    channel.postEthProviderEvent('chainChanged', [chainId])
  }
  const connect: Provider.EventMap['connect'] = (connectInfo) => {
    channel.postEthProviderEvent('connect', [connectInfo])
  }
  const disconnect: Provider.EventMap['disconnect'] = (providerRpcError) => {
    channel.postEthProviderEvent('disconnect', [providerRpcError])
  }
  const message: Provider.EventMap['message'] = (message) => {
    channel.postEthProviderEvent('message', [message])
  }

  channel.addListener('ethProviderRequest', listener)
  externalProvider.on('accountsChanged', accountsChanged)
  externalProvider.on('chainChanged', chainChanged)
  externalProvider.on('connect', connect)
  externalProvider.on('disconnect', disconnect)
  externalProvider.on('message', message)

  return () => {
    channel.removeListener('ethProviderRequest', listener)
    externalProvider.removeListener('accountsChanged', accountsChanged)
    externalProvider.removeListener('chainChanged', chainChanged)
    externalProvider.removeListener('connect', connect)
    externalProvider.removeListener('disconnect', disconnect)
    externalProvider.removeListener('message', message)
  }
}
