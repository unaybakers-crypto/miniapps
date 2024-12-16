import type { Address, Provider, RpcRequest, RpcResponse, RpcSchema } from "ox";
import { FrameNotificationDetails } from "./schemas";

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

export type FrameLocationContextCastEmbed = {
  type: "cast_embed";
  cast: {
    fid: number;
    hash: string;
  };
};

export type FrameLocationContextNotification = {
  type: "notification";
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};

export type FrameLocationContextLauncher = {
  type: "launcher";
};

export type FrameLocationContext =
  | FrameLocationContextCastEmbed
  | FrameLocationContextNotification
  | FrameLocationContextLauncher;

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
  client: {
    clientFid: number;
    added: boolean;
    notificationDetails?: FrameNotificationDetails;
  };
};

export type AddFrameResult =
  | {
      added: true;
      notificationDetails?: FrameNotificationDetails;
    }
  | {
      added: false;
      reason: "invalid_domain_manifest" | "rejected_by_user";
    };

export type AddFrame = () => Promise<AddFrameResult>;

export type ReadyOptions = {
  /**
   * Disable native gestures. Use this option if your frame uses gestures
   * that conflict with native gestures.
   *
   * @defaultValue false
   */
  disableNativeGestures: boolean;
};

export const DEFAULT_READY_OPTIONS: ReadyOptions = {
  disableNativeGestures: false,
};

export type SignInOptions  = {
 /**
  * A random string used to prevent replay attacks.
  */
  nonce: string;

 /**
  * Start time at which the signature becomes valid. 
  * ISO 8601 datetime.	
  */
  notBefore?: string;

  /**
   * Expiration time at which the signature is no longer valid. 
   * ISO 8601 datetime.	
   */
  expirationTime?: string;
};



export type SignInNotSupported  = {
  type: 'not_supported'
};

export type SignInRejectedByUser  = {
  type: 'rejected_by_user'
};

export type SignInFailureReason = SignInNotSupported | SignInRejectedByUser;

export type SignInResult = {
  success: true;
  result: { token: string; };
} | {
  success: false;
  failureReason: SignInFailureReason;
}

export type FrameHost = {
  context: FrameContext;
  close: () => void;
  ready: (options?: Partial<ReadyOptions>) => void;
  openUrl: (url: string) => void;
  signIn: (options: SignInOptions) => Promise<SignInResult>;
  setPrimaryButton: SetPrimaryButton;
  ethProviderRequest: EthProviderRequest;
  ethProviderRequestV2: RpcTransport;
  addFrame: AddFrame;
};

export type FrameEthProviderEventData = {
  type: "frame_eth_provider_event";
} & EthProviderWireEvent;

export type RpcTransport = (
  request: RpcRequest.RpcRequest,
) => Promise<RpcResponse.RpcResponse>;

export type ProviderRpcError = {
  code: number;
  details?: string;
  message?: string;
};

export type EthProviderWireEvent =
  | {
      event: "accountsChanged";
      params: [readonly Address.Address[]];
    }
  | {
      event: "chainChanged";
      params: [string];
    }
  | {
      event: "connect";
      params: [Provider.ConnectInfo];
    }
  | {
      event: "disconnect";
      params: [ProviderRpcError];
    }
  | {
      event: "message";
      params: [Provider.Message];
    };

export type EmitEthProvider = <event extends EthProviderWireEvent["event"]>(
  event: event,
  params: Extract<EthProviderWireEvent, { event: event }>["params"],
) => void;
