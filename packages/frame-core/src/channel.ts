import type { RpcRequest, RpcResponse } from 'ox'
import type { EthProviderWireEvent, FrameClientEvent } from '.'

export interface EventSource {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: {},
  ): void

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: {},
  ): void
}

export interface Endpoint extends EventSource {
  postMessage(data?: any): void
}

export type HostResponseMessage = {
  source: 'farcaster-host-response'
  payload: RpcResponse.RpcResponse
}

export function isHostResponseMessage(data: any): data is HostResponseMessage {
  return data.source === 'farcaster-host-response'
}

export type HostEventMessage = {
  source: 'farcaster-host-event'
  payload: FrameClientEvent
}

export function isHostEventMessage(data: any): data is HostEventMessage {
  return data.source === 'farcaster-host-event'
}

export type MiniAppRequestMessage = {
  source: 'farcaster-mini-app-request'
  payload: RpcRequest.RpcRequest
}

export function isMiniAppRequestMessage(
  data: any,
): data is MiniAppRequestMessage {
  return data.source === 'farcaster-mini-app-request'
}

export type EthProviderRequestMessage = {
  source: 'farcaster-eth-provider-request'
  payload: RpcRequest.RpcRequest
}

export function isEthProviderRequestMessage(
  data: any,
): data is MiniAppRequestMessage {
  return data.source === 'farcaster-eth-provider-request'
}

export type EthProviderResponseMessage = {
  source: 'farcaster-eth-provider-response'
  payload: RpcResponse.RpcResponse
}

export function isEthProviderResponseMessage(
  data: any,
): data is EthProviderResponseMessage {
  return data.source === 'farcaster-eth-provider-response'
}

export type EthProviderEventMessage = {
  source: 'farcaster-eth-provider-event'
  payload: EthProviderWireEvent
}

export function isEthProviderEventMessage(
  data: any,
): data is EthProviderEventMessage {
  return data.source === 'farcaster-eth-provider-event'
}

export type HostMessage =
  | HostResponseMessage
  | HostEventMessage
  | EthProviderResponseMessage
  | EthProviderEventMessage

export type MiniAppMessage = MiniAppRequestMessage | EthProviderRequestMessage
