import * as Comlink from "comlink";
import { RefObject, useCallback, useEffect, useRef } from "react";
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";
import { WebViewEndpoint, createWebViewRpcEndpoint } from "./endpoint";
import type { FrameHost } from "@farcaster/frame-core";
import { wrapProviderRequest, forwardProviderEvents } from "./helpers/provider";
import { Provider } from "ox";

/**
 * Returns a handler of RPC message from WebView.
 */
export function useWebViewRpcAdapter(
  webViewRef: RefObject<WebView>,
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>,
  provider?: Provider.Provider,
) {
  const endpointRef = useRef<WebViewEndpoint>();

  const onMessage: WebViewProps["onMessage"] = useCallback(
    (e: WebViewMessageEvent) => {
      endpointRef.current?.onMessage(e);
    },
    [endpointRef],
  );

  useEffect(() => {
    const endpoint = createWebViewRpcEndpoint(webViewRef);
    endpointRef.current = endpoint;

    const extendedSdk = sdk as FrameHost;

    if (provider) {
      extendedSdk.ethProviderRequestV2 = wrapProviderRequest(provider);
    }

    Comlink.expose(extendedSdk, endpoint);

    let cleanup: () => void | undefined;
    if (provider) {
      cleanup = forwardProviderEvents(provider, endpoint);
    }

    return () => {
      cleanup?.()
      endpointRef.current = undefined;
    };
  }, [webViewRef, sdk, provider]);

  return {
    onMessage,
    emit: endpointRef.current?.emit,
    emitEthProvider: endpointRef.current?.emitEthProvider,
  };
}
