export const EVENT_TYPES = ["ROKA", "ENGAGEMENT", "MEHENDI", "HALDI", "SANGEET", "COCKTAIL", "WEDDING", "RECEPTION", "CUSTOM"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type WeddingEventData = {
  id: string;
  name: string;
  type: EventType;
  startsAt: string;
  endsAt: string | null;
  venueName: string;
  address: string;
  description: string;
  dressCode: string;
  archivedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
