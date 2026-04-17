# SAPulse4 — Site Vitrine One-Page

## Objectif
Créer un site vitrine one-page premium pour **BK Pulse** (anciennement SAPulse4), cabinet de conseil ERP Cloud SAP spécialisé assurance/mutuelles/courtage. Fait partie de **BK Partners Group**.

## Charte graphique
- **Couleur principale :** Rose #c2185b
- **Couleur secondaire :** Orange #ea580c  
- **Dégradé signature :** Rose → Orange (utilisé pour CTA, headers, accents)
- **Font :** Nunito (Google Fonts)
- **Style :** Moderne, corporate premium, clean, aéré
- **Logo :** `/public/logo.png` (déjà présent — 3 personnages sur vague rose→orange)

## Tech
- Next.js 14 + Tailwind CSS (SSR standalone, `output: 'standalone'`)
- PostgreSQL + Prisma 6 (contenu dynamique)
- One-page scroll smooth (ancres)
- Responsive mobile-first
- Animations subtiles au scroll (CSS ou framer-motion)

## Architecture Back Office

Le contenu du site est géré dynamiquement via une BDD PostgreSQL et un back office admin.

### Fichiers clés
- `src/app/home-client.tsx` — Client component, utilise `t(content, "clé", "fallback")` pour chaque texte
- `src/app/page.tsx` — Server component, charge le contenu via `loadSiteContent()`
- `src/lib/content.ts` — Service de chargement du contenu depuis Prisma
- `src/app/admin/page.tsx` — Dashboard back office (édition contenu, gestion users, changement mdp)
- `prisma/seed.ts` + `prisma/seed-prod.mjs` — Scripts de seed (même données, formats différents)
- `src/app/api/admin/content/route.ts` — CRUD contenu (GET, PUT, PATCH)
- `src/app/api/admin/users/route.ts` — CRUD utilisateurs (GET, POST, DELETE)
- `src/app/api/auth/password/route.ts` — Changement de mot de passe

### Règle CRITIQUE : synchroniser code et BDD

Quand on modifie le site (ajout/suppression/renommage de texte) :

1. **Modifier `home-client.tsx`** — ajouter/modifier l'appel `t(content, "nouvelle.clé", "fallback")`
2. **Modifier les 2 seeds** — ajouter la clé dans `prisma/seed.ts` ET `prisma/seed-prod.mjs`
3. **Ajouter en BDD** — soit relancer le seed, soit ajouter manuellement via le back office

Le fallback garantit que le site ne casse jamais si une clé manque en BDD, mais le back office ne montre QUE les clés présentes en BDD. Un texte non seedé ne sera pas éditable par la chargée de com.

### Rôles utilisateurs
- **admin** : éditer le contenu + gérer les utilisateurs
- **editor** : éditer le contenu uniquement

## Sections (dans l'ordre)
1. **Hero** — Titre "L'ERP qui va à votre rythme", sous-titre accrocheur, CTA "Évaluez votre éligibilité", fond avec dégradé rose→orange subtil
2. **Promesse** — 3 cards : Déploiement rapide / Standard intelligent / Zéro lourdeur technique
3. **Pour qui** — 3 colonnes : Dirigeants / DAF / DSI avec leurs bénéfices
4. **Cloud SAP** — Processus métiers prêts / Mises à jour auto / Sécurité & conformité / IA & analytics
5. **Méthode** — Timeline : Diagnostic → Configuration agile → Go-Live en quelques semaines
6. **CTA final** — "Et si votre ERP devenait enfin un levier de croissance ?" + bouton contact
7. **Footer** — BK Partners Group, mentions légales, contact

## Contenu complet (copier tel quel)

### Hero
**BK Pulse — L'ERP qui va à votre rythme**
Transformez votre entreprise en quelques semaines, pas en 18 mois. BK Pulse réinvente le déploiement ERP pour les acteurs de l'assurance, des mutuelles et du courtage.
Notre promesse : vous offrir la puissance d'un ERP Cloud standard, avec la rapidité et l'agilité dont votre business a réellement besoin.

### Accélérez. Simplifiez. Pilotez.
- Déploiement rapide : un socle opérationnel en quelques semaines
- Standard intelligent : basé sur les meilleures pratiques du marché
- Zéro lourdeur technique : tout est pensé pour aller vite, sans compromis

### Une approche pensée pour vos enjeux
- **Dirigeants** : accélérez votre croissance et réduisez votre time-to-market
- **DAF** : fiabilisez vos données et pilotez votre rentabilité en temps réel
- **DSI** : libérez-vous de la maintenance et concentrez-vous sur l'innovation

### Le Cloud SAP, sans la complexité
- Processus métiers prêts à l'emploi
- Mises à jour automatiques
- Sécurité et conformité intégrées
- IA et analytics embarqués

### La méthode BK Pulse
Diagnostic → Configuration agile → Go-Live en quelques semaines
Pas de tunnel projet. Pas de complexité inutile. Juste de l'efficacité.

### CTA
Et si votre ERP devenait enfin un levier de croissance ?
Évaluez votre éligibilité à un déploiement rapide en 15 minutes.

## GitLab
- **Instance :** https://git.dev.bkco.link
- **Projet :** `renaud/sapulse4-site` (ID 3, nom "bk pulse")
- **Board :** https://git.dev.bkco.link/renaud/sapulse4-site/-/boards
- **Token :** variable `GITLAB_TOKEN` ou voir mémoire projet

## Règles
- NE PAS utiliser de librairies UI complexes (shadcn, etc.) — juste Tailwind
- Le site doit build avec `npm run build` sans erreur
- Tester avec `npx next dev` que tout s'affiche
- Utiliser le logo depuis /logo.png
- Le contenu est géré via le back office (BDD) — les fallbacks restent dans le code
- Le site doit être BEAU — niveau agence, pas template basique
