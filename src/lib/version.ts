export const APP_VERSION = "2026.16.1-1";

export interface Release {
  version: string;
  date: string;
  title: string;
  type: "major" | "feature" | "fix" | "security";
  highlights: string[];
  details?: string[];
}

export const RELEASES: Release[] = [
  {
    version: "2026.16.1-1",
    date: "2026-04-17",
    title: "Back Office CMS + Sécurité",
    type: "major",
    highlights: [
      "Back office complet pour gérer le contenu du site",
      "Éditeur rich text Notion-like (gras, titres, dégradés, couleurs)",
      "Aperçu réaliste du site avant publication",
      "Gestion des utilisateurs (admin/éditeur)",
      "Audit sécurité complet et corrections",
    ],
    details: [
      "Base de données PostgreSQL + Prisma ORM",
      "Authentification JWT avec cookies httpOnly",
      "Rate limiting sur le login (5 tentatives/min)",
      "Security headers (X-Frame, X-Content-Type, Referrer-Policy)",
      "Validation des inputs (taille, format, XSS)",
      "Password policy (majuscule + minuscule + chiffre + 8 chars)",
      "Middleware server-side pour protéger les routes admin",
      "9 sections éditables, 78+ champs de contenu",
      "Mode preview avec token temporaire (5min)",
      "Changement de mot de passe par l'utilisateur",
      "Nouveau footer minimaliste avec LinkedIn",
      "Photos DG/DAF/DSI/Cloud SAP mises à jour",
      "Hero : dégradé sur 'nouvelle impulsion' et 'avec SAP'",
      "Passage de static export à SSR standalone Next.js",
      "Docker multi-stage avec migrations auto au démarrage",
      "Déploiement Coolify staging + production",
    ],
  },
];
