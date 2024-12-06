import { RefObject, useCallback, useEffect, useRef } from "react";
import type { Provider } from "ox";
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";
import type { FrameHost } from "@farcaster/frame-core";
import { exposeToEndpoint } from "@farcaster/frame-host";
import { WebViewEndpoint, createWebViewRpcEndpoint } from "./webview";

/**
 * Returns a handler of RPC message from WebView.
 */
export function useWebViewRpcAdapter({
  webViewRef,
  sdk,
  frameOrigin,
  ethProvider
}: {
  webViewRef: RefObject<WebView>;
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>;
  frameOrigin: string;
  ethProvider?: Provider.Provider;
}) {
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

    const cleanup = exposeToEndpoint({
      endpoint, 
      sdk, 
      ethProvider,
      frameOrigin
    });

    return () => {
      cleanup?.()
      endpointRef.current = undefined;
    };
  }, [webViewRef, sdk, ethProvider, frameOrigin]);

  return {
    onMessage,
    emit: endpointRef.current?.emit,
    emitEthProvider: endpointRef.current?.emitEthProvider,
  };
}
