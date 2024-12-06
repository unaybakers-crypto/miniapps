import type { Endpoint } from "./comlink";
import type { EmitEthProvider } from "@farcaster/frame-core";

export type HostEndpoint = Endpoint & {
  emit: (data: any) => void;
  emitEthProvider: EmitEthProvider;
};
