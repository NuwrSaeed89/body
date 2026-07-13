import { getServerSessionUser } from "@/lib/auth/get-session";
import { shouldUseWishlistMock } from "@/lib/wishlist/should-use-wishlist-mock";

export type WishlistApiUser = {
  userId: string;
  email: string;
};

export async function requireWishlistUser(): Promise<WishlistApiUser | Response> {
  if (shouldUseWishlistMock()) {
    return Response.json(
      { error: "Wishlist sync requires live Supabase. Set NEXT_PUBLIC_USE_MOCK_DATA=false." },
      { status: 503 },
    );
  }

  const user = await getServerSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { userId: user.id, email: user.email };
}
