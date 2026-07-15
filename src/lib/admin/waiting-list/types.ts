export type WaitingNotifyStatus = "waiting" | "notified";

export type AdminWaitingListRow = {
  id: string;
  email: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string | null;
  variantLabel: string;
  size: string | null;
  color: string | null;
  userId: string | null;
  status: WaitingNotifyStatus;
  statusLabel: string;
  notifiedAt: string | null;
  notifiedAtLabel: string;
  createdAt: string;
  createdAtLabel: string;
};

export type AdminWaitingListData = {
  source: "supabase" | "mock";
  rows: AdminWaitingListRow[];
  totalCount: number;
  waitingCount: number;
  notifiedCount: number;
};
