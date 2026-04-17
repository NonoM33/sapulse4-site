import { loadSiteContent } from "@/lib/content";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

async function loadPreviewOverrides(token: string | null): Promise<Record<string, string>> {
  if (!token) return {};
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/preview?token=${token}`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    return data.overrides ?? {};
  } catch {
    return {};
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const content = await loadSiteContent();
  const overrides = await loadPreviewOverrides(params.preview ?? null);

  // Merge overrides on top of DB content
  const merged = { ...content, ...overrides };

  return <HomeClient content={merged} />;
}
