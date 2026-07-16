import type { NewsletterSource } from "@/lib/newsletter/types";
import type { EspConfigStatus } from "@/lib/newsletter/esp/types";

export type AdminNewsletterRow = {
  id: string;
  email: string;
  locale: string;
  source: NewsletterSource;
  sourceLabel: string;
  confirmed: boolean;
  confirmationLabel: string;
  syncedToEsp: boolean;
  espLabel: string;
  consentedAt: string;
  consentedAtLabel: string;
  createdAt: string;
  createdAtLabel: string;
};

export type AdminNewsletterData = {
  source: "supabase" | "mock";
  subscribers: AdminNewsletterRow[];
  totalCount: number;
  pendingConfirmationCount: number;
  pendingEspSyncCount: number;
  esp: EspConfigStatus;
};
