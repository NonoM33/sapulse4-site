import { loadSiteContent } from "@/lib/content";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await loadSiteContent();
  return <HomeClient content={content} />;
}
