import { subscribeNewsletter } from "@/lib/newsletter/subscribe-newsletter";
import type { NewsletterSource } from "@/lib/newsletter/types";

type NewsletterRequestBody = {
  email?: string;
  locale?: string;
  source?: NewsletterSource;
  consent?: boolean;
};

export async function POST(request: Request) {
  let body: NewsletterRequestBody;
  try {
    body = (await request.json()) as NewsletterRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await subscribeNewsletter({
    email: body.email,
    locale: body.locale ?? "en",
    source: body.source ?? "homepage",
    consented: body.consent === true,
  });

  if (!result.ok) {
    const status =
      result.error === "invalid_email" || result.error === "consent_required" ? 400 : 500;
    return Response.json(result, { status });
  }

  return Response.json(result);
}
