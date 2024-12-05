import * as Comlink from "comlink";
import type { Provider } from "ox";
import { FrameHost } from "@farcaster/frame-core";
import { HostEndpoint } from "./types";
import { exposeToEndpoint } from "./helpers/endpoint";

/**
 * An endpoint of communicating with an iFrame
 */
export function createIframeEndpoint(
  iframe: HTMLIFrameElement,
  debug = true
): HostEndpoint {
  return {
    // when is contentWindow null
    ...Comlink.windowEndpoint(iframe.contentWindow!),
    emit: (event) => {
      if (debug) {
        console.debug("frameEvent", event);
      }

      const wireEvent = { 
        type: 'frameEvent',
        event
      };

      iframe.contentWindow?.postMessage(wireEvent, '*');
    },
    emitEthProvider: (event, params) => {
      if (debug) {
        console.debug("fc:emitEthProvider", event, params);
      }

      const wireEvent = { 
        type: 'frameEthProviderEvent',
        event, 
        params 
      };

      iframe.contentWindow?.postMessage(wireEvent, '*')
    },
  };
}

export function exposeToIframe(
  iframe: HTMLIFrameElement,
  sdk: Omit<FrameHost, 'ethProviderRequestV2'>,
  provider?: Provider.Provider,
) {
  const endpoint = createIframeEndpoint(iframe);
  const cleanup = exposeToEndpoint(endpoint, sdk, provider);

  return {
    endpoint,
    cleanup
  }
}
