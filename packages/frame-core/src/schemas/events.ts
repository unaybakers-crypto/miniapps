import { z } from 'zod';
import { notificationDetailsSchema } from './notifications';

export const eventFrameAddedPayloadSchema = z.object({
  event: z.literal("frame_added"),
  notificationDetails: notificationDetailsSchema.optional(),
});

export type EventFrameAddedPayload = z.infer<
  typeof eventFrameAddedPayloadSchema
>;

export const eventFrameRemovedPayloadSchema = z.object({
  event: z.literal("frame_removed"),
});

export type EventFrameRemovedPayload = z.infer<
  typeof eventFrameRemovedPayloadSchema
>;

export const eventNotificationsEnabledPayloadSchema = z.object({
  event: z.literal("notifications_enabled"),
  notificationDetails: notificationDetailsSchema.required(),
});

export type EventNotificationsEnabledPayload = z.infer<
  typeof eventNotificationsEnabledPayloadSchema
>;

export const notificationsDisabledPayloadSchema = z.object({
  event: z.literal("notifications_disabled"),
});

export type EventNotificationsDisabledPayload = z.infer<
  typeof notificationsDisabledPayloadSchema
>;

export const eventPayloadSchema = z.discriminatedUnion("event", [
  eventFrameAddedPayloadSchema,
  eventFrameRemovedPayloadSchema,
  eventNotificationsEnabledPayloadSchema,
  notificationsDisabledPayloadSchema,
]);

export type FrameEvent = z.infer<typeof eventPayloadSchema>;


