import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/lib/cms/pages";
import { PageRenderer } from "@/components/blocks/page-renderer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    return { title: "Page introuvable" };
  }
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
    openGraph: page.ogImageUrl ? { images: [{ url: page.ogImageUrl }] } : undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <img src="/logo.svg" alt="BK Pulse" className="h-8" />
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-pink-600 transition">
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <article>
        <PageRenderer blocks={page.blocks} />
      </article>

      <footer className="border-t border-gray-100 py-10 mt-10 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto px-6">
          © {new Date().getFullYear()} BK Pulse — BK Partners Group
        </div>
      </footer>
    </main>
  );
}
