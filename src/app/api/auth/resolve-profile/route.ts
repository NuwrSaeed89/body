import { resolveProfileIdByEmail } from "@/lib/cart/cart-service";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (shouldUseCartMock()) {
    return Response.json({ profileId: null, mock: true });
  }

  try {
    const profileId = await resolveProfileIdByEmail(email);
    if (!profileId) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }
    return Response.json({ profileId });
  } catch (error) {
    console.error("[auth] resolve-profile failed:", error);
    return Response.json({ error: "Could not resolve profile" }, { status: 500 });
  }
}
