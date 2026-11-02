import { z } from "zod";
import { EVENT_TYPES } from "./types";
import { parseOffsetDateTime } from "./datetime";

const offsetDateTime = z.string().refine((value) => parseOffsetDateTime(value) !== null, "Use a valid date and time with a timezone offset.");

export const eventFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(EVENT_TYPES).optional(),
  startsAt: offsetDateTime,
  endsAt: offsetDateTime.nullable().optional(),
  venueName: z.string().trim().max(160).optional(),
  address: z.string().trim().max(300).optional(),
  description: z.string().trim().max(1000).optional(),
  dressCode: z.string().trim().max(160).optional(),
}).strict();

export const createEventSchema = eventFieldsSchema;
export const updateEventSchema = eventFieldsSchema.partial();

export function hasValidEventRange(startsAt: string | Date, endsAt?: string | Date | null) {
  return !endsAt || new Date(endsAt).getTime() > new Date(startsAt).getTime();
}
