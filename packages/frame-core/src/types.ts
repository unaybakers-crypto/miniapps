import type { AddFrame, SignIn, Swap, ViewProfile, ViewToken } from './actions'
import type { FrameContext } from './context'
import type {
  EventFrameAdded,
  EventFrameRemoved,
  EventNotificationsDisabled,
  EventNotificationsEnabled,
} from './schemas'
import type { Ethereum } from './wallet'

export type SetPrimaryButtonOptions = {
  text: string
  loading?: boolean
  disabled?: boolean
  hidden?: boolean
}

// re-exported for backwards compat, remove in 1.0
export * from './wallet/ethereum'

export type SetPrimaryButton = (options: SetPrimaryButtonOptions) => void

export type ReadyOptions = {
  /**
   * Disable native gestures. Use this option if your frame uses gestures
   * that conflict with native gestures.
   *
   * @defaultValue false
   */
  disableNativeGestures: boolean
}

export const DEFAULT_READY_OPTIONS: ReadyOptions = {
  disableNativeGestures: false,
}

export type WireFrameHost = {
  context: FrameContext
  close: () => void
  ready: (options?: Partial<ReadyOptions>) => void
  openUrl: (url: string) => void
  signIn: SignIn.WireSignIn
  setPrimaryButton: SetPrimaryButton
  ethProviderRequest: Ethereum.EthProvideRequest
  ethProviderRequestV2: Ethereum.RpcTransport
  eip6963RequestProvider: () => void
  addFrame: AddFrame.WireAddFrame
  viewProfile: ViewProfile.ViewProfile
  viewToken: ViewToken.ViewToken
  swap: Swap.Swap
}

export type FrameHost = {
  context: FrameContext
  close: () => void
  ready: (options?: Partial<ReadyOptions>) => void
  openUrl: (url: string) => void
  signIn: SignIn.SignIn
  setPrimaryButton: SetPrimaryButton
  ethProviderRequest: Ethereum.EthProvideRequest
  ethProviderRequestV2: Ethereum.RpcTransport
  /**
   * Receive forwarded eip6963:requestProvider events from the frame document.
   * Hosts must emit an EventEip6963AnnounceProvider in response.
   */
  eip6963RequestProvider: () => void
  addFrame: AddFrame.AddFrame
  viewProfile: ViewProfile.ViewProfile
  viewToken: ViewToken.ViewToken
  swap: Swap.Swap
}

export type EventFrameAddRejected = {
  event: 'frame_add_rejected'
  reason: AddFrame.AddFrameRejectedReason
}

export type EventPrimaryButtonClicked = {
  event: 'primary_button_clicked'
}

export type FrameClientEvent =
  | EventFrameAdded
  | EventFrameAddRejected
  | EventFrameRemoved
  | EventNotificationsEnabled
  | EventNotificationsDisabled
  | EventPrimaryButtonClicked
  | Ethereum.EventEip6963AnnounceProvider
