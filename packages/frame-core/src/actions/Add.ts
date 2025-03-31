import { RpcResponse } from 'ox'
import { type Errors, Provider } from '..'
import type { Transport } from '../jsonRpc'

export declare namespace add {
  type ErrorType =
    | InvalidFarcasterJsonError
    | Provider.UserRejectedRequestError
    | Errors.GlobalErrorType
}

export async function add(transport: Transport) {
  try {
    return await transport.request({ method: 'app_add' })
  } catch (e) {
    if (e instanceof RpcResponse.BaseError && e.code === 4000) {
      if (e.code === 4000) {
        const data = e.data as { name: add.ErrorType['name'] }
        if (data.name === 'Provider.UserRejectedRequestError') {
          throw new Provider.UserRejectedRequestError()
        }
        if (data.name === 'Add.InvalidFarcasterJsonError') {
          throw new InvalidFarcasterJsonError()
        }
      }
    }

    throw e
  }
}

/**
 * Thrown when the frame does not have a valid domain manifest.
 */
export class InvalidFarcasterJsonError extends Provider.ProviderRpcError {
  override readonly name = 'Add.InvalidFarcasterJsonError'

  constructor() {
    super(4000, 'Invalid farcaster.json', {
      docsPath: '/docs/actions/add',
    })
  }
}
