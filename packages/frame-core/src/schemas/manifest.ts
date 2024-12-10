import { z } from 'zod';
import { secureUrlSchema, frameNameSchema, colorValueSchema, encodedJsonFarcasterSignatureSchema } from './shared';

export const domainFrameConfig = z.object({
  version: z.string(),
  name: frameNameSchema,
  iconUrl: secureUrlSchema,
  homeUrl: secureUrlSchema,
  splashImageUrl: secureUrlSchema.optional(),
  splashBackgroundColor: colorValueSchema.optional(),
  webhookUrl: secureUrlSchema.optional()
});

export const domainManifest = z.object({
  accountAssociation: encodedJsonFarcasterSignatureSchema,
  frame: domainFrameConfig.optional(),
});
