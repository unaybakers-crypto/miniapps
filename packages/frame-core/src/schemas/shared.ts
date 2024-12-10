import { z } from 'zod';

export const secureUrlSchema = z.string().url().startsWith('https://', { message: 'Must be an https url' }).max(512);

export const frameNameSchema = z.string().max(32);

export const colorValueSchema = z.string().max(9).optional();

export const encodedJsonFarcasterSignatureSchema = z.object({
  header: z.string(),
  payload: z.string(),
  signature: z.string(),
});

export type EncodedJsonFarcasterSignatureSchema = z.infer<typeof encodedJsonFarcasterSignatureSchema>;

export const jsonFarcasterSignatureHeaderSchema = z.object({
  fid: z.number(),
  type: z.literal("app_key"),
  key: z.string().startsWith("0x"),
});

export type JsonFarcasterSignatureHeaderSchema = z.infer<typeof jsonFarcasterSignatureHeaderSchema>;
