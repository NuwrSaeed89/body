import { getServerSessionUser } from "@/lib/auth/get-session";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

export async function POST() {
  if (shouldUseCartMock()) {
    return Response.json({ profileId: null, mock: true });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ profileId: user.id });
}
