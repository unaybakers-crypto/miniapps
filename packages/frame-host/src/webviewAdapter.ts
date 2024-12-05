import { RefObject, useCallback, useEffect, useRef } from "react";
import type { Provider } from "ox";
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";
import type { FrameHost } from "@farcaster/frame-core";
import { WebViewEndpoint, createWebViewRpcEndpoint } from "./webview";
import { exposeToEndpoint } from "./helpers/endpoint";

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

    const cleanup = exposeToEndpoint(endpoint, sdk, provider);

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
