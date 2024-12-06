import * as Comlink from "comlink";
import { FrameHost } from "@farcaster/frame-core";
import { Provider } from "ox";
import { forwardProviderEvents, wrapProviderRequest } from "./provider";
import { HostEndpoint } from "../types";

/**
  * @returns function to cleanup provider listeners
  */
export function exposeToEndpoint(
  { 
    endpoint,
    sdk, 
    frameOrigin,
    ethProvider, 
  }: {
    endpoint: HostEndpoint,
    sdk: Omit<FrameHost, 'ethProviderRequestV2'>,
    frameOrigin: string;
    ethProvider?: Provider.Provider,
  }
) {
  const extendedSdk = sdk as FrameHost;

  let cleanup: () => void | undefined;
  if (ethProvider) {
    extendedSdk.ethProviderRequestV2 = wrapProviderRequest(ethProvider);
    cleanup = forwardProviderEvents(ethProvider, endpoint);
  }

  Comlink.expose(extendedSdk, endpoint, [frameOrigin]);

  return () => {
    cleanup?.();
  }
}
