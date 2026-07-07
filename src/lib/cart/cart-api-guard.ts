import { getServerSessionUser } from "@/lib/auth/get-session";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

export type CartApiUser = {
  userId: string;
  email: string;
};

/** Requires a logged-in customer; userId matches profiles.id for cart tables. */
export async function requireCartUser(): Promise<CartApiUser | Response> {
  if (shouldUseCartMock()) {
    return Response.json(
      { error: "Cart requires live Supabase. Set NEXT_PUBLIC_USE_MOCK_DATA=false." },
      { status: 503 },
    );
  }

  const user = await getServerSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { userId: user.id, email: user.email };
}
