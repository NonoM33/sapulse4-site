# Améliorations UX/UI à implémenter

## CRITIQUES (à faire absolument)

### 1. Menu mobile hamburger
- Ajouter un bouton hamburger visible en mobile (md:hidden)
- Menu slide-in ou overlay avec les mêmes liens
- Utiliser useState pour toggle

### 2. Remplacer TOUS les emoji par des icônes SVG inline
- Installer lucide-react : `pnpm add lucide-react`
- ⚡ → Zap, 🎯 → Target, 🚀 → Rocket
- 👔 → Briefcase, 📊 → BarChart3, 💻 → Monitor
- 🏗️ → Building2, 🔄 → RefreshCw, 🔒 → Shield, 🤖 → Brain
- Les icônes doivent avoir la couleur #c2185b ou le dégradé
- Taille cohérente : les wraper dans un div rond avec bg gradient subtle

### 3. Formulaire de contact (remplacer le mailto)
- Section CTA : ajouter un formulaire inline (Nom, Email, Téléphone, Message)
- Pas besoin de backend — juste le HTML/CSS avec un action mailto ou formspree placeholder
- Style : inputs arrondis, focus ring gradient, bouton submit gradient

### 4. Fix mobile responsive
- Hero h1 : `text-3xl sm:text-4xl md:text-5xl lg:text-7xl`
- Stats bar hero : `grid-cols-1 sm:grid-cols-3` avec dividers
- Toutes les grilles : ajouter breakpoint `sm:grid-cols-2 md:grid-cols-3`

### 5. Fix © 2024 → © 2026

## IMPORTANTES (niveau agence)

### 6. Varier le font-weight
- Titres sections : garder extrabold
- Sous-titres cards : bold (pas extrabold)
- Descriptions : normal/medium
- Ne PAS utiliser extrabold pour les h3 des feature cards

### 7. Section crédibilité (après le CTA, avant footer)
- Bande de logos "Ils nous font confiance" (même fictifs/placeholder en gris)
- OU une citation/témoignage avec photo placeholder
- Texte en italique, nom + poste + entreprise

### 8. Améliorer les animations
- Stagger les cards : custom={i} avec delay 0.15s entre chaque
- Section Méthode : faire apparaître la ligne de connexion en animation (scaleX de 0 à 1)
- Hero : ajouter un léger parallax sur les blobs (ou juste un floating animation CSS)
- Varier : certaines sections fadeIn au lieu de fadeUp

### 9. Varier le spacing entre sections
- Hero → Promesse : py-24 (garder)
- Promesse → Pour qui : py-20
- Pour qui → Cloud SAP : py-28
- Cloud SAP → Méthode : py-24
- Méthode → CTA : py-32 (garder)
- Ça casse la monotonie

### 10. Cloud SAP section — agrandir les textes
- h3 : text-base au lieu de text-sm
- Description : text-sm au lieu de text-xs
- Padding : p-8 au lieu de p-6

### 11. Section Méthode — fix le contraste durée
- Le tag durée : mettre text-white bg-white/10 border-white/20 au lieu de borderColor #c2185b et color #ea580c

### 12. Hover effect sur les CTA principaux
- Ajouter une légère rotation ou un gradient shift au hover
- Le hover:scale-105 c'est bien, ajouter aussi un box-shadow coloré (shadow-rose-500/20)

## BONUS (si le temps)

### 13. Floating animation sur les blobs du hero
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

### 14. Smooth scroll indicator dans le hero
- Petite flèche animée en bas du hero qui invite à scroller

## RÈGLES
- NE PAS casser le build
- Garder Nunito, garder la charte rose→orange
- Tester `npm run build` à la fin
- Le site doit rester RAPIDE (pas de libs lourdes)
