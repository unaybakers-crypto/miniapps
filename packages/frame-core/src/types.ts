import type { Address, Provider, RpcRequest, RpcResponse, RpcSchema } from "ox";
import { z } from "zod";

export type SetPrimaryButton = (options: {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) => void;

export type EthProviderRequest = Provider.RequestFn<RpcSchema.Default>;

export type AccountLocation = {
  placeId: string;
  /**
   * Human-readable string describing the location
   */
  description: string;
};

export type FrameLocationNotificationContext = {
  type: "notification";
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};

export type FrameLocationContext = FrameLocationNotificationContext;

export type FrameContext = {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    /**
     * Profile image URL
     */
    pfpUrl?: string;
  };
  location?: FrameLocationContext;
};

export const notificationDetailsSchema = z.object({
  url: z.string(),
  token: z.string(),
});
export type FrameNotificationDetails = z.infer<
  typeof notificationDetailsSchema
>;

export type AddFrameResult =
  | {
      added: true;
      notificationDetails?: FrameNotificationDetails;
    }
  | {
      added: false;
      reason: "invalid-domain-manifest" | "rejected-by-user";
    };

export type AddFrame = () => Promise<AddFrameResult>;

export type FrameHost = {
  context: FrameContext;
  close: () => void;
  ready: (options: Partial<{ 
    /**
      * Disable native gestures. Use this option if your frame uses gestures
      * that conflict with native gestures. 
      */
    disableNativeGestures: boolean; 
  }>) => void;
  openUrl: (url: string) => void;
  setPrimaryButton: SetPrimaryButton;
  ethProviderRequest: EthProviderRequest;
  ethProviderRequestV2: RpcTransport;
  addFrame: AddFrame;
};

export const eventSchema = z.object({
  header: z.string(),
  payload: z.string(),
  signature: z.string(),
});
export type EventSchema = z.infer<typeof eventSchema>;

// JSON Farcaster Signature header after decoding

export const eventHeaderSchema = z.object({
  fid: z.number(),
  type: z.literal("app_key"),
  key: z.string().startsWith("0x"),
});
export type EventHeader = z.infer<typeof eventHeaderSchema>;

// Webhook event payload after decoding

export const eventFrameAddedPayloadSchema = z.object({
  event: z.literal("frame-added"),
  notificationDetails: notificationDetailsSchema.optional(),
});
export type EventFrameAddedPayload = z.infer<
  typeof eventFrameAddedPayloadSchema
>;

export const eventFrameRemovedPayloadSchema = z.object({
  event: z.literal("frame-removed"),
});
export type EventFrameRemovedPayload = z.infer<
  typeof eventFrameRemovedPayloadSchema
>;

export const eventNotificationsEnabledPayloadSchema = z.object({
  event: z.literal("notifications-enabled"),
  notificationDetails: notificationDetailsSchema.required(),
});
export type EventNotificationsEnabledPayload = z.infer<
  typeof eventNotificationsEnabledPayloadSchema
>;

export const notificationsDisabledPayloadSchema = z.object({
  event: z.literal("notifications-disabled"),
});
export type EventNotificationsDisabledPayload = z.infer<
  typeof notificationsDisabledPayloadSchema
>;

export const eventPayloadSchema = z.discriminatedUnion("event", [
  eventFrameAddedPayloadSchema,
  eventFrameRemovedPayloadSchema,
  eventNotificationsEnabledPayloadSchema,
  notificationsDisabledPayloadSchema,
]);
export type FrameEvent = z.infer<typeof eventPayloadSchema>;

// Notifications API request and response formats

export const sendNotificationRequestSchema = z.object({
  notificationId: z.string().uuid(),
  title: z.string().max(32),
  body: z.string().max(128),
  targetUrl: z.string().max(256),
  tokens: z.string().array().max(100),
});
export type SendNotificationRequest = z.infer<
  typeof sendNotificationRequestSchema
>;

export const sendNotificationResponseSchema = z.object({
  result: z.object({
    successfulTokens: z.array(z.string()),
    invalidTokens: z.array(z.string()),
    rateLimitedTokens: z.array(z.string()),
  }),
});
export type SendNotificationResponse = z.infer<
  typeof sendNotificationResponseSchema
>;

export type FrameEthProviderEventData = {
  type: 'frameEthProviderEvent',
} & EthProviderWireEvent;

export type RpcTransport = (
  request: RpcRequest.RpcRequest
) => Promise<RpcResponse.RpcResponse>;

export type ProviderRpcError = {
  code: number;
  details?: string;
  message?: string;
}

export type EthProviderWireEvent = {
  event: "accountsChanged",
  params: [readonly Address.Address[]]
} | {
  event: "chainChanged",
  params: [string]
} | {
  event: "connect",
  params: [Provider.ConnectInfo]
} | {
  event: "disconnect",
  params: [ProviderRpcError]
} | {
  event: "message",
  params: [Provider.Message]
};

export type EmitEthProvider = <
  event extends EthProviderWireEvent['event']
>(
  event: event,
  params: Extract<EthProviderWireEvent, { event: event }>['params']
) => void;
