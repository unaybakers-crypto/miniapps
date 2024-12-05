import type * as Comlink from "comlink";
import type { EmitEthProvider } from "@farcaster/frame-core";

export type HostEndpoint = Comlink.Endpoint & {
  emit: (data: any) => void;
  emitEthProvider: EmitEthProvider;
};
