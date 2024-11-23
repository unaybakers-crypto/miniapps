import * as Comlink from "comlink";
import { RefObject } from "react";
import WebView, { WebViewMessageEvent } from "react-native-webview";
export declare const SYMBOL_IGNORING_RPC_RESPONSE_ERROR: symbol;
export type WebViewEndpoint = Comlink.Endpoint & {
    /**
     * Manually distribute events to listeners as an alternative to `document.addEventHandler` which is unavailable in React Native.
     */
    onMessage: (e: WebViewMessageEvent) => void;
};
/**
 * An endpoint of communicating with WebView
 */
export declare function createWebViewRpcEndpoint(ref: RefObject<WebView>): WebViewEndpoint & {
    emit: (data: any) => void;
};
