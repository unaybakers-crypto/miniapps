import * as Comlink from "comlink";
import { FrameHost } from "@farcaster/frame-core";
import { Provider } from "ox";
import { forwardProviderEvents, wrapProviderRequest } from "./provider";
import { HostEndpoint } from "../types";

/**
  * @returns function to cleanup provider listeners
  */
export function exposeToEndpoint(
  endpoint: HostEndpoint,
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>,
  provider?: Provider.Provider,
) {
  const extendedSdk = sdk as FrameHost;

  let cleanup: () => void | undefined;
  if (provider) {
    extendedSdk.ethProviderRequestV2 = wrapProviderRequest(provider);
    cleanup = forwardProviderEvents(provider, endpoint);
  }

  Comlink.expose(extendedSdk, endpoint);

  return () => {
    cleanup?.();
  }
}
