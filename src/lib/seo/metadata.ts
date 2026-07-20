import type { Metadata } from "next";
import {
  absoluteUrl,
  languageAlternates,
  openGraphLocale,
} from "@/lib/seo/paths";

type BuildPageMetadataInput = {
  locale: string;
  /** Path after locale, e.g. "/shop" or "/shop/slug" */
  path: string;
  title: string;
  description: string;
  images?: Array<{ url: string; alt?: string; width?: number; height?: number }>;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function truncateMetaDescription(text: string, max = 160): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const description = truncateMetaDescription(input.description);
  const url = absoluteUrl(input.locale, input.path);
  const images =
    input.images && input.images.length > 0
      ? input.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          width: image.width ?? 1200,
          height: image.height ?? 630,
        }))
      : undefined;

  return {
    title: {
      absolute: input.title,
    },
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(input.path),
    },
    openGraph: {
      type: input.type ?? "website",
      locale: openGraphLocale(input.locale),
      url,
      siteName: "Mbody",
      title: input.title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: images?.map((image) => image.url),
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
