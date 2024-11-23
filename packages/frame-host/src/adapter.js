import * as Comlink from "comlink";
import { useCallback, useEffect, useRef } from "react";
import { createWebViewRpcEndpoint } from "./endpoint";
/**
 * Returns a handler of RPC message from WebView.
 */
export function useWebViewRpcAdapter(webViewRef, sdk) {
    var _a;
    const endpointRef = useRef();
    const onMessage = useCallback((e) => {
        var _a;
        (_a = endpointRef.current) === null || _a === void 0 ? void 0 : _a.onMessage(e);
    }, [endpointRef]);
    useEffect(() => {
        const endpoint = createWebViewRpcEndpoint(webViewRef);
        endpointRef.current = endpoint;
        Comlink.expose(sdk, endpoint);
        return () => {
            endpointRef.current = undefined;
        };
    }, [webViewRef, sdk]);
    return {
        onMessage,
        emit: (_a = endpointRef.current) === null || _a === void 0 ? void 0 : _a.emit,
    };
}
