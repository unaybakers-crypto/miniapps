import { Provider, type RpcRequest, RpcResponse } from 'ox'

/**
 * Wraps a provider's request function with a result format that can transfer
 * errors across scripting boundaries.
 */
export const wrapProviderRequest =
  ({
    provider,
    debug = false,
  }: {
    provider: Provider.Provider
    debug?: boolean
  }) =>
  async (request: RpcRequest.RpcRequest) => {
    try {
      if (debug) {
        console.debug('[frame-host] eth provider req: ', request)
      }
      const result = await provider.request(request)
      const response = RpcResponse.from({ result }, { request })

      if (debug) {
        console.debug('[frame-host] eth provider res: ', response)
      }

      return response
    } catch (e) {
      if (debug) {
        console.error('provider request error', e)
      }
      if (e instanceof Provider.ProviderRpcError) {
        return RpcResponse.from(
          {
            error: {
              message: e.message,
              code: e.code,
              details: e.details,
            },
          },
          { request },
        )
      }

      if (
        e !== null &&
        typeof e === 'object' &&
        'message' in e &&
        typeof e.message === 'string' &&
        'code' in e &&
        typeof e.code === 'number'
      ) {
        return RpcResponse.from(
          {
            error: {
              message: e.message,
              code: e.code,
              details:
                'details' in e && typeof e.details === 'string'
                  ? e.details
                  : undefined,
            },
          },
          { request },
        )
      }

      const errorMessage = e instanceof Error ? e.message : 'Unknown'
      return RpcResponse.from(
        {
          error: {
            message: errorMessage,
            code: 1000,
          },
        },
        { request },
      )
    }
  }
