import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
import "./globals.css";
import { loadSiteContent, c } from "@/lib/content";
import CookieConsent from "@/components/cookie-consent";

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
        <Script id="openpanel-init" strategy="beforeInteractive">
          {`window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();var consent=localStorage.getItem('bkpulse_cookie_consent');if(consent!=='refused'){window.op('init',{apiUrl:'/api/t/op',clientId:'fc4b026a-f705-44d6-8f86-627bb3481d0f',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});}`}
        </Script>
        <Script src="https://openpanel.dev/op1.js" strategy="afterInteractive" />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
