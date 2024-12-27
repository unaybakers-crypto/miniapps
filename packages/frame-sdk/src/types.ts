import type {
  AddFrame,
  AddFrameRejectedReason,
  FrameContext,
  FrameNotificationDetails,
  ReadyOptions,
  SetPrimaryButtonOptions,
  SignIn,
} from '@farcaster/frame-core'
import type { EventEmitter } from 'eventemitter3'
import type { Provider } from 'ox'

declare global {
  interface Window {
    // Exposed by react-native-webview
    ReactNativeWebView: {
      postMessage: (message: string) => void
    }
  }
}

/** Combines members of an intersection into a readable type. */
// https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=v01xkqU3KO0Mg
type Compute<type> = { [key in keyof type]: type[key] } & unknown

export type EventMap = {
  primaryButtonClicked: () => void
  frameAdded: ({
    notificationDetails,
  }: {
    notificationDetails?: FrameNotificationDetails
  }) => void
  frameAddRejected: ({ reason }: { reason: AddFrameRejectedReason }) => void
  frameRemoved: () => void
  notificationsEnabled: ({
    notificationDetails,
  }: {
    notificationDetails: FrameNotificationDetails
  }) => void
  notificationsDisabled: () => void
}

export type Emitter = Compute<EventEmitter<EventMap>>

type SetPrimaryButton = (options: SetPrimaryButtonOptions) => Promise<void>

export type FrameSDK = {
  context: Promise<FrameContext>
  actions: {
    ready: (options?: Partial<ReadyOptions>) => Promise<void>
    openUrl: (url: string) => Promise<void>
    signIn: SignIn.SignIn
    close: () => Promise<void>
    setPrimaryButton: SetPrimaryButton
    addFrame: AddFrame
  }
  wallet: {
    ethProvider: Provider.Provider
  }
} & Emitter
