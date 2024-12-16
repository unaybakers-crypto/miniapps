import { z } from "zod";
import {
  secureUrlSchema,
  frameNameSchema,
  hexColorSchema,
  encodedJsonFarcasterSignatureSchema,
  buttonTitleSchema,
} from "./shared";

export const domainFrameConfigSchema = z.object({
  // 0.0.0 and 0.0.1 are not technically part of the spec but kept for
  // backwards compatibilty
  version: z.union([z.literal("0.0.0"), z.literal("0.0.1"), z.literal("1")]),
  name: frameNameSchema,
  iconUrl: secureUrlSchema,
  homeUrl: secureUrlSchema,
  imageUrl: secureUrlSchema.optional(),
  buttonTitle: buttonTitleSchema.optional(),
  splashImageUrl: secureUrlSchema.optional(),
  splashBackgroundColor: hexColorSchema.optional(),
  webhookUrl: secureUrlSchema.optional(),
});

export const domainManifestSchema = z.object({
  accountAssociation: encodedJsonFarcasterSignatureSchema,
  frame: domainFrameConfigSchema.optional(),
});
