import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

interface ContentEntry {
  key: string;
  value: string;
  section: string;
  label: string;
  sortOrder: number;
}

const contents: ContentEntry[] = [
  // ─── META ───
  { key: "meta.title", value: "BK Pulse — Donnez une nouvelle impulsion à votre entreprise avec SAP", section: "meta", label: "Titre de la page (SEO)", sortOrder: 1 },
  { key: "meta.description", value: "BK Pulse réinvente le déploiement ERP pour les acteurs de l'assurance, des mutuelles et du courtage. Transformez votre entreprise en quelques semaines, pas en 18 mois.", section: "meta", label: "Description de la page (SEO)", sortOrder: 2 },

  // ─── NAV ───
  { key: "nav.link1", value: "Promesse", section: "nav", label: "Lien navigation 1", sortOrder: 1 },
  { key: "nav.link2", value: "Cloud SAP", section: "nav", label: "Lien navigation 2", sortOrder: 2 },
  { key: "nav.link3", value: "Pour vous", section: "nav", label: "Lien navigation 3", sortOrder: 3 },
  { key: "nav.link4", value: "Méthode", section: "nav", label: "Lien navigation 4", sortOrder: 4 },
  { key: "nav.link5", value: "Contact", section: "nav", label: "Lien navigation 5", sortOrder: 5 },
  { key: "nav.cta", value: "Prendre contact", section: "nav", label: "Bouton CTA navigation", sortOrder: 6 },

  // ─── HERO ───
  { key: "hero.title.line1", value: "Donnez une nouvelle impulsion", section: "hero", label: "Titre ligne 1", sortOrder: 1 },
  { key: "hero.title.line2", value: "à votre entreprise avec SAP", section: "hero", label: "Titre ligne 2 (dégradé)", sortOrder: 2 },
  { key: "hero.subtitle", value: "Partenaire certifié SAP PartnerEdge SELL, BK Pulse déploie SAP en quelques semaines grâce à une méthodologie agile et efficace. Nous sommes le moteur qui propulse la solution SAP ERP Cloud Public vers les entreprises du secteur de l'assurance, des mutuelles et des courtiers avec un accès direct aux dernières innovations Cloud et IA.", section: "hero", label: "Sous-titre hero", sortOrder: 3 },
  { key: "hero.subtitle.highlight", value: "quelques semaines", section: "hero", label: "Texte en gras dans le sous-titre", sortOrder: 4 },
  { key: "hero.cta", value: "Prendre contact", section: "hero", label: "Bouton CTA hero", sortOrder: 5 },
  { key: "hero.scroll", value: "Scroll", section: "hero", label: "Indicateur de scroll", sortOrder: 6 },

  // ─── PROMESSE ───
  { key: "promesse.title", value: "Accélérez. Simplifiez. Pilotez.", section: "promesse", label: "Titre section Promesse", sortOrder: 1 },
  { key: "promesse.title.highlight", value: "Simplifiez.", section: "promesse", label: "Mot en dégradé dans le titre", sortOrder: 2 },
  { key: "promesse.subtitle", value: "Trois piliers pour transformer votre déploiement ERP en avantage concurrentiel.", section: "promesse", label: "Sous-titre section Promesse", sortOrder: 3 },
  { key: "promesse.card1.title", value: "Déploiement rapide qui bat la mesure", section: "promesse", label: "Card 1 — Titre", sortOrder: 4 },
  { key: "promesse.card1.desc", value: "SAP ERP Cloud Public en 18 semaines.", section: "promesse", label: "Card 1 — Description", sortOrder: 5 },
  { key: "promesse.card2.title", value: "Standard intelligent avec de l'IA embarquée", section: "promesse", label: "Card 2 — Titre", sortOrder: 6 },
  { key: "promesse.card2.desc", value: "IA intégrée nativement dans les applications SAP pour faciliter le pilotage de votre quotidien.", section: "promesse", label: "Card 2 — Description", sortOrder: 7 },
  { key: "promesse.card3.title", value: "Zéro lourdeur technique", section: "promesse", label: "Card 3 — Titre", sortOrder: 8 },
  { key: "promesse.card3.desc", value: "Tout est pensé pour aller vite, sans compromis sur la qualité ou la sécurité grâce au cloud.", section: "promesse", label: "Card 3 — Description", sortOrder: 9 },

  // ─── CLOUD SAP ───
  { key: "cloudSap.badge", value: "Technologie SAP", section: "cloudSap", label: "Badge section", sortOrder: 1 },
  { key: "cloudSap.title.line1", value: "SAP facile", section: "cloudSap", label: "Titre ligne 1", sortOrder: 2 },
  { key: "cloudSap.title.line2", value: "et accessible", section: "cloudSap", label: "Titre ligne 2 (dégradé)", sortOrder: 3 },
  { key: "cloudSap.description", value: "Le parcours GROW with SAP permet aux entreprises en croissance de déployer rapidement SAP. Alliez la puissance de l'intelligence artificielle aux meilleures pratiques sectorielles pour piloter votre activité avec agilité. Un déploiement maîtrisé, des processus automatisés et un soutien expert : tout est réuni pour stimuler votre innovation dès aujourd'hui.", section: "cloudSap", label: "Description principale", sortOrder: 4 },
  { key: "cloudSap.team.title", value: "Équipe certifiée SAP", section: "cloudSap", label: "Légende photo équipe — titre", sortOrder: 5 },
  { key: "cloudSap.team.subtitle", value: "Experts assurance, mutuelles & courtage", section: "cloudSap", label: "Légende photo équipe — sous-titre", sortOrder: 6 },
  { key: "cloudSap.cta", value: "En savoir plus →", section: "cloudSap", label: "Lien CTA", sortOrder: 7 },
  { key: "cloudSap.card1.title", value: "Processus métiers prêts à l'emploi", section: "cloudSap", label: "Card 1 — Titre", sortOrder: 8 },
  { key: "cloudSap.card1.desc", value: "Toutes les fonctions de l'entreprise sont connectées et créent une organisation dynamique axée sur les données.", section: "cloudSap", label: "Card 1 — Description", sortOrder: 9 },
  { key: "cloudSap.card2.title", value: "Mises à jour automatiques", section: "cloudSap", label: "Card 2 — Titre", sortOrder: 10 },
  { key: "cloudSap.card2.desc", value: "Toujours sur la dernière version SAP, sans effort de votre côté.", section: "cloudSap", label: "Card 2 — Description", sortOrder: 11 },
  { key: "cloudSap.card3.title", value: "Sécurité & conformité intégrées", section: "cloudSap", label: "Card 3 — Titre", sortOrder: 12 },
  { key: "cloudSap.card3.desc", value: "La puissance des modèles SaaS européens et respect du RGPD.", section: "cloudSap", label: "Card 3 — Description", sortOrder: 13 },
  { key: "cloudSap.card4.title", value: "IA & analytics embarqués", section: "cloudSap", label: "Card 4 — Titre", sortOrder: 14 },
  { key: "cloudSap.card4.desc", value: "Tableaux de bord intelligents et prédictions métiers intégrés.", section: "cloudSap", label: "Card 4 — Description", sortOrder: 15 },

  // ─── POUR QUI ───
  { key: "pourQui.title.line1", value: "Une approche pensée", section: "pourQui", label: "Titre ligne 1", sortOrder: 1 },
  { key: "pourQui.title.line2", value: "pour vos enjeux", section: "pourQui", label: "Titre ligne 2 (dégradé)", sortOrder: 2 },
  { key: "pourQui.subtitle", value: "Quel que soit votre rôle, SAP ERP Cloud Public vous apporte des réponses concrètes.", section: "pourQui", label: "Sous-titre section", sortOrder: 3 },

  // Persona 1: DG
  { key: "pourQui.persona1.role", value: "Directeur Général", section: "pourQui", label: "Persona 1 — Rôle", sortOrder: 4 },
  { key: "pourQui.persona1.benefit", value: "Accélérez votre croissance et réduisez votre time-to-market", section: "pourQui", label: "Persona 1 — Bénéfice", sortOrder: 5 },
  { key: "pourQui.persona1.tagline", value: "Transformez votre structure de coût en levier de croissance immédiat.", section: "pourQui", label: "Persona 1 — Tagline", sortOrder: 6 },
  { key: "pourQui.persona1.desc", value: "Prenez une longueur d'avance. Ne laissez plus votre système d'information freiner votre expansion. Intégrez de nouveaux portefeuilles et lancez vos produits avec une agilité inédite.", section: "pourQui", label: "Persona 1 — Description", sortOrder: 7 },
  { key: "pourQui.persona1.point1", value: "Vision temps réel de la performance", section: "pourQui", label: "Persona 1 — Point 1", sortOrder: 8 },
  { key: "pourQui.persona1.point2", value: "Décisions basées sur la donnée", section: "pourQui", label: "Persona 1 — Point 2", sortOrder: 9 },
  { key: "pourQui.persona1.point3", value: "ROI mesurable en semaines", section: "pourQui", label: "Persona 1 — Point 3", sortOrder: 10 },

  // Persona 2: DAF
  { key: "pourQui.persona2.role", value: "DAF", section: "pourQui", label: "Persona 2 — Rôle", sortOrder: 11 },
  { key: "pourQui.persona2.benefit", value: "Fiabilisez vos données et pilotez votre rentabilité en temps réel", section: "pourQui", label: "Persona 2 — Bénéfice", sortOrder: 12 },
  { key: "pourQui.persona2.tagline", value: "Passez du constat à l'analyse prédictive avec un standard mondial.", section: "pourQui", label: "Persona 2 — Tagline", sortOrder: 13 },
  { key: "pourQui.persona2.desc", value: "Pilotez au scalpel. Automatisez la gestion des primes, sécurisez vos clôtures et accédez à un reporting financier en temps réel conforme aux exigences réglementaires.", section: "pourQui", label: "Persona 2 — Description", sortOrder: 14 },
  { key: "pourQui.persona2.point1", value: "Clôtures accélérées", section: "pourQui", label: "Persona 2 — Point 1", sortOrder: 15 },
  { key: "pourQui.persona2.point2", value: "Consolidation automatisée", section: "pourQui", label: "Persona 2 — Point 2", sortOrder: 16 },
  { key: "pourQui.persona2.point3", value: "Conformité réglementaire intégrée", section: "pourQui", label: "Persona 2 — Point 3", sortOrder: 17 },

  // Persona 3: DSI
  { key: "pourQui.persona3.role", value: "DSI", section: "pourQui", label: "Persona 3 — Rôle", sortOrder: 18 },
  { key: "pourQui.persona3.benefit", value: "Libérez-vous de la maintenance et concentrez-vous sur l'innovation", section: "pourQui", label: "Persona 3 — Bénéfice", sortOrder: 19 },
  { key: "pourQui.persona3.tagline", value: "", section: "pourQui", label: "Persona 3 — Tagline", sortOrder: 20 },
  { key: "pourQui.persona3.desc", value: "Innovez sans contrainte. Libérez-vous de la maintenance infrastructure. Adoptez une stratégie 'Clean Core' avec des mises à jour automatiques et une sécurité native.", section: "pourQui", label: "Persona 3 — Description", sortOrder: 21 },
  { key: "pourQui.persona3.point1", value: "Zéro infrastructure à gérer", section: "pourQui", label: "Persona 3 — Point 1", sortOrder: 22 },
  { key: "pourQui.persona3.point2", value: "Mises à jour automatiques SAP", section: "pourQui", label: "Persona 3 — Point 2", sortOrder: 23 },
  { key: "pourQui.persona3.point3", value: "Intégrations API simplifiées", section: "pourQui", label: "Persona 3 — Point 3", sortOrder: 24 },

  // ─── MÉTHODE ───
  { key: "methode.badge", value: "La méthode BK Pulse", section: "methode", label: "Badge section", sortOrder: 1 },
  { key: "methode.title.line1", value: "Votre ERP déployé en", section: "methode", label: "Titre ligne 1", sortOrder: 2 },
  { key: "methode.title.highlight", value: "18 semaines", section: "methode", label: "Titre highlight (dégradé)", sortOrder: 3 },
  { key: "methode.subtitle", value: "Pas de tunnel projet. Pas de complexité inutile. Juste de l'efficacité.", section: "methode", label: "Sous-titre", sortOrder: 4 },

  // ─── CTA FINAL ───
  { key: "cta.title.line1", value: "Et si votre ERP devenait enfin", section: "cta", label: "Titre ligne 1", sortOrder: 1 },
  { key: "cta.title.line2", value: "un levier de croissance\u00a0?", section: "cta", label: "Titre ligne 2 (dégradé)", sortOrder: 2 },
  { key: "cta.subtitle", value: "Évaluez votre éligibilité à un déploiement rapide en 15 minutes. Notre équipe d'experts vous accompagne à chaque étape.", section: "cta", label: "Sous-titre CTA", sortOrder: 3 },
  { key: "cta.typeformId", value: "kMV1RSpR", section: "cta", label: "ID du formulaire Typeform", sortOrder: 4 },
  { key: "cta.badge1", value: "✓ Réponse sous 24h", section: "cta", label: "Badge confiance 1", sortOrder: 5 },
  { key: "cta.badge2", value: "✓ Diagnostic offert", section: "cta", label: "Badge confiance 2", sortOrder: 6 },
  { key: "cta.badge3", value: "✓ Sans engagement", section: "cta", label: "Badge confiance 3", sortOrder: 7 },

  // ─── FOOTER ───
  { key: "footer.description", value: "BK Pulse — Cabinet de conseil ERP Cloud SAP spécialisé assurance, mutuelles et courtage.", section: "footer", label: "Description entreprise", sortOrder: 1 },
  { key: "footer.group", value: "Membre de BK Partners Group", section: "footer", label: "Mention groupe", sortOrder: 2 },
  { key: "footer.contact.email", value: "contact@bkpartners.fr", section: "footer", label: "Email de contact", sortOrder: 3 },
  { key: "footer.contact.legal", value: "SAP, SAP S/4HANA sont des marques déposées de SAP SE.", section: "footer", label: "Mention légale SAP", sortOrder: 4 },
  { key: "footer.copyright", value: "© 2026 BK Pulse — BK Partners Group. Tous droits réservés.", section: "footer", label: "Copyright", sortOrder: 5 },
];

async function main() {
  console.log("Seeding site content...");

  for (const entry of contents) {
    await prisma.siteContent.upsert({
      where: { key: entry.key },
      update: { value: entry.value, section: entry.section, label: entry.label, sortOrder: entry.sortOrder },
      create: entry,
    });
  }

  console.log(`  ${contents.length} content entries seeded.`);

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bkpulse.fr";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashSync(adminPassword, 12),
      name: "Admin BK Pulse",
      role: "admin",
    },
  });

  console.log(`  Admin user created: ${adminEmail}`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
