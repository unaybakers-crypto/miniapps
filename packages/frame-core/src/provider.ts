import { EventEmitter } from 'eventemitter3'
import { RpcResponse, type RpcSchema } from 'ox'
import { Errors } from '.'
import type { AddFrame } from './actions'
import type { Compute, IsNever } from './internal/types'
import type { Schema } from './jsonRpc'
import type { FrameNotificationDetails } from './schemas'

export type EventMap = {
  primaryButtonClicked: () => void
  frameAdded: ({
    notificationDetails,
  }: {
    notificationDetails?: FrameNotificationDetails
  }) => void
  frameAddRejected: ({
    reason,
  }: { reason: AddFrame.AddFrameRejectedReason }) => void
  frameRemoved: () => void
  notificationsEnabled: ({
    notificationDetails,
  }: {
    notificationDetails: FrameNotificationDetails
  }) => void
  notificationsDisabled: () => void
}

export type Emitter = Compute<EventEmitter<EventMap>>

export type EventListenerFn = <event extends keyof EventMap>(
  event: event,
  listener: EventMap[event],
) => void

export type RequestFn = <
  methodName extends RpcSchema.ExtractMethodName<Schema>,
>(
  parameters: RpcSchema.ExtractRequest<Schema, methodName>,
) => Promise<RpcSchema.ExtractReturnType<Schema, methodName>>

export type Provider = Compute<{
  request: RequestFn
  on: EventListenerFn
  removeListener: EventListenerFn
}>

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

export function parseError<
  const errorObject extends RpcResponse.ErrorObject | unknown,
>(
  errorObject: errorObject | RpcResponse.ErrorObject,
): parseError.ReturnType<errorObject> {
  const errorObject_ = errorObject as RpcResponse.ErrorObject
  const error = RpcResponse.parseError(errorObject_)
  if (error instanceof RpcResponse.InternalError) {
    if (!error.data) return error as never

    const { code } = error.data as RpcResponse.ErrorObject
    if (code === UserRejectedRequestError.code)
      return new UserRejectedRequestError(errorObject_) as never
  }
  return error as never
}

export declare namespace parseError {
  type ReturnType<
    errorObject extends RpcResponse.ErrorObject | unknown,
    error = errorObject extends RpcResponse.ErrorObject
      ? errorObject['code'] extends UserRejectedRequestError['code']
        ? UserRejectedRequestError
        : never
      : RpcResponse.parseError.ReturnType<RpcResponse.ErrorObject>,
  > = IsNever<error> extends true
    ? RpcResponse.parseError.ReturnType<errorObject>
    : error
}

export class ProviderRpcError extends Errors.BaseError {
  override name = 'ProviderRpcError'

  code: number
  details: string

  constructor(
    code: number,
    message: string,
    { docsPath }: Errors.BaseError.Options = {},
  ) {
    super(message, { docsPath })
    this.code = code
    this.details = message
  }
}

export class UserRejectedRequestError extends ProviderRpcError {
  static readonly code = 4001
  override readonly code = 4001
  override readonly name = 'Provider.UserRejectedRequestError'

  constructor({
    message = 'The user rejected the request.',
  }: { message?: string | undefined } = {}) {
    super(4001, message)
  }
}
