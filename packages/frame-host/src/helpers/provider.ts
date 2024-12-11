import { Provider, RpcRequest, RpcResponse } from "ox";
import { HostEndpoint } from "../types";

export function forwardProviderEvents({
  provider,
  endpoint,
}: {
  provider: Provider.Provider;
  endpoint: HostEndpoint;
}) {
  let accountsChanged: Provider.EventMap["accountsChanged"] = (accounts) => {
    endpoint.emitEthProvider("accountsChanged", [accounts]);
  };
  let chainChanged: Provider.EventMap["chainChanged"] = (chainId) => {
    endpoint.emitEthProvider("chainChanged", [chainId]);
  };
  let connect: Provider.EventMap["connect"] = (connectInfo) => {
    endpoint.emitEthProvider("connect", [connectInfo]);
  };
  let disconnect: Provider.EventMap["disconnect"] = (providerRpcError) => {
    endpoint.emitEthProvider("disconnect", [providerRpcError]);
  };
  let message: Provider.EventMap["message"] = (message) => {
    endpoint.emitEthProvider("message", [message]);
  };

  provider.on("accountsChanged", accountsChanged);
  provider.on("chainChanged", chainChanged);
  provider.on("connect", connect);
  provider.on("disconnect", disconnect);
  provider.on("message", message);

  return () => {
    provider.removeListener("accountsChanged", accountsChanged);
    provider.removeListener("chainChanged", chainChanged);
    provider.removeListener("connect", connect);
    provider.removeListener("disconnect", disconnect);
    provider.removeListener("message", message);
  };
}

// export type FrameTransport<
//   raw extends boolean = false,
//   schema extends RpcSchema.Generic = RpcSchema.Default,
// > = RP RpcTransport<raw, {}, schema>

/**
 * Wraps a provider's request function with a result format that can transfer
 * errors across scripting boundaries.
 */
export const wrapProviderRequest =
  ({
    provider,
    debug = false,
  }: {
    provider: Provider.Provider;
    debug?: boolean;
  }) =>
  async (request: RpcRequest.RpcRequest) => {
    try {
      if (debug) {
        console.debug("[frame-host] eth provider req: ", request);
      }
      const result = await provider.request(request);
      const response = RpcResponse.from({ result }, { request });

      if (debug) {
        console.debug("[frame-host] eth provider res: ", response);
      }

      return response;
    } catch (e) {
      if (debug) {
        console.error("provider request error", e);
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
          { request }
        );
      }

      if (
        e !== null &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string" &&
        "code" in e &&
        typeof e.code === "number"
      ) {
        return RpcResponse.from(
          {
            error: {
              message: e.message,
              code: e.code,
              details:
                "details" in e && typeof e.details === "string"
                  ? e.details
                  : undefined,
            },
          },
          { request }
        );
      }

      const errorMessage = e instanceof Error ? e.message : "Unknown";
      return RpcResponse.from(
        {
          error: {
            message: errorMessage,
            code: 1000,
          },
        },
        { request }
      );
    }
  };
