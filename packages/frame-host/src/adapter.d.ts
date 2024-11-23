import { RefObject } from "react";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import type { FrameHost } from "@farcaster/frame-core";
/**
 * Returns a handler of RPC message from WebView.
 */
export declare function useWebViewRpcAdapter(webViewRef: RefObject<WebView>, sdk: FrameHost): {
    onMessage: (event: WebViewMessageEvent) => void;
    emit: ((data: any) => void) | undefined;
};
