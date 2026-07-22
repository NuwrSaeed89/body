const ALLOWED_HOST_SUFFIXES = [".supabase.co", "modelviewer.dev"] as const;

function isAllowedModelUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const ok = ALLOWED_HOST_SUFFIXES.some((suffix) =>
      suffix.startsWith(".")
        ? url.hostname.endsWith(suffix)
        : url.hostname === suffix,
    );
    return ok ? url : null;
  } catch {
    return null;
  }
}

/** Proxy GLB/GLTF from Supabase (or demo CDN) with correct model content-type. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim();
  if (!target) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const parsed = isAllowedModelUrl(target);
  if (!parsed) {
    return Response.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: { Accept: "model/gltf-binary,model/gltf+json,*/*" },
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return Response.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const bytes = await upstream.arrayBuffer();
    const pathname = parsed.pathname.toLowerCase();
    const contentType = pathname.endsWith(".gltf")
      ? "model/gltf+json"
      : pathname.endsWith(".usdz")
        ? "model/vnd.usdz+zip"
        : "model/gltf-binary";

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[models/proxy] fetch failed:", error);
    return Response.json({ error: "Failed to fetch model" }, { status: 502 });
  }
}
