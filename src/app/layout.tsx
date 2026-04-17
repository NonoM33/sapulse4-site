import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { loadSiteContent, c } from "@/lib/content";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadSiteContent();
  return {
    title: c(content, "meta.title", "BK Pulse — Donnez une nouvelle impulsion à votre entreprise avec SAP"),
    description: c(
      content,
      "meta.description",
      "BK Pulse réinvente le déploiement ERP pour les acteurs de l'assurance, des mutuelles et du courtage. Transformez votre entreprise en quelques semaines, pas en 18 mois."
    ),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${nunito.variable} font-nunito antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
