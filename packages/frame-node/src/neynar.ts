import { BaseError, VerifyAppKey, VerifyAppKeyResult } from "./types";
import { z } from "zod";
import { AbiParameters } from "ox";

const apiKey = process.env.NEYNAR_API_KEY || "";

export const signedKeyRequestAbi = [
  {
    components: [
      {
        name: "requestFid",
        type: "uint256",
      },
      {
        name: "requestSigner",
        type: "address",
      },
      {
        name: "signature",
        type: "bytes",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "SignedKeyRequest",
    type: "tuple",
  },
] as const;

const neynarResponseSchema = z.object({
  events: z.array(
    z.object({
      signerEventBody: z.object({
        key: z.string(),
        metadata: z.string(),
      }),
    }),
  ),
});

export const verifyAppKeyWithNeynar: VerifyAppKey = async (
  fid: number,
  appKey: string,
): Promise<VerifyAppKeyResult> => {
  if (!apiKey) {
    throw new Error(
      "Environment variable NEYNAR_API_KEY needs to be set to use Neynar for app key verification",
    );
  }

  const url = new URL("https://hub-api.neynar.com/v1/onChainSignersByFid");
  url.searchParams.append("fid", fid.toString());

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (response.status !== 200) {
    throw new BaseError(`Non-200 response received: ${await response.text()}`);
  }

  const responseJson = await response.json();
  const parsedResponse = neynarResponseSchema.safeParse(responseJson);
  if (parsedResponse.error) {
    throw new BaseError("Error parsing Neynar response", parsedResponse.error);
  }

  const appKeyLower = appKey.toLowerCase();

  const signerEvent = parsedResponse.data.events.find(
    (event) => event.signerEventBody.key.toLowerCase() === appKeyLower,
  );
  if (!signerEvent) {
    return { valid: false };
  }

  const decoded = AbiParameters.decode(
    signedKeyRequestAbi,
    Buffer.from(signerEvent.signerEventBody.metadata, "base64"),
  );
  if (decoded.length !== 1) {
    throw new BaseError("Error decoding metadata");
  }

  const appFid = Number(decoded[0].requestFid);

  return { valid: true, appFid };
};
