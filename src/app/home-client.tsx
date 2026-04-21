"use client";

import Image from "next/image";
import { useState, useId, useEffect, type ElementType } from "react";
import { motion, type Variants, type Easing } from "framer-motion";
import dynamic from "next/dynamic";
import { FitTextOnNowrap } from "@/components/fit-text-on-nowrap";
const TypeformWidget = dynamic(
  () => import("@typeform/embed-react").then((mod) => mod.Widget),
  { ssr: false, loading: () => <div className="w-full h-[500px] flex items-center justify-center text-gray-400">Chargement du formulaire...</div> }
);
import {
  Zap, Target, Rocket,
  Briefcase, BarChart3, Monitor,
  Building2, RefreshCw, Shield, Brain,
  Menu, X,
} from "lucide-react";

export type ContentMap = Record<string, string>;

/** Strip a single <p>...</p> wrapper when the inner text has no other tags. */
function unwrapSimpleParagraph(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^<p>([\s\S]*?)<\/p>$/);
  if (match && !/<[a-z/]/i.test(match[1])) {
    return match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }
  return value;
}

/** Helper: get content with fallback, auto-unwrapping editor-produced paragraphs. */
function t(content: ContentMap, key: string, fallback: string): string {
  const raw = content[key] ?? fallback;
  return unwrapSimpleParagraph(raw);
}

/** True if the given string contains real HTML tags (produced by the rich editor). */
function hasHtml(value: string): boolean {
  return /<[a-z/]/i.test(value);
}

/** If the string is a SINGLE top-level <p>…</p> block, strip or convert it.
 *  - Bare <p>X</p>                → X                (inline content)
 *  - <p attr="v">X</p>            → <span attr="v">X</span> (preserve attrs)
 *  If the content has multiple top-level paragraphs or nested <p>, leave
 *  it untouched so we don't corrupt content like
 *  "<p>Accélérez.</p><p>Simplifiez. Pilotez.</p>".
 */
function normalizeRootParagraph(html: string): string {
  const trimmed = html.trim();
  const openMatch = trimmed.match(/^<p(\s[^>]*)?>/i);
  if (!openMatch || !trimmed.endsWith("</p>")) return html;
  const innerStart = openMatch[0].length;
  const innerEnd = trimmed.length - "</p>".length;
  const inner = trimmed.slice(innerStart, innerEnd);
  // Inner must NOT contain another <p> opening tag — otherwise there are
  // multiple top-level paragraphs and stripping would mangle the output.
  if (/<p(\s|>)/i.test(inner)) return html;
  const attrs = openMatch[1] ?? "";
  return attrs ? `<span${attrs}>${inner}</span>` : inner;
}

/** Render arbitrary text that may contain HTML from the rich editor.
 *  Uses a <div> when the content contains block-level tags (so multiple
 *  paragraphs aren't mangled by the browser auto-fixing invalid span>p),
 *  <span> otherwise. */
function Rich({ value }: { value: string }) {
  if (!hasHtml(value)) return <>{value}</>;
  const normalized = normalizeRootParagraph(value);
  const isBlock = /<(p|div|h[1-6]|ul|ol|li|blockquote|hr|pre)[\s>]/i.test(normalized);
  if (isBlock) {
    return <div className="rich-content" dangerouslySetInnerHTML={{ __html: normalized }} />;
  }
  return <span className="rich-content" dangerouslySetInnerHTML={{ __html: normalized }} />;
}

const ease: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, delay: i * 0.15, ease },
  }),
};

const blurUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.2, ease },
  }),
};

/* ─── Wave SVG Components ──────────────────────────── */

function WaveSeparatorSolid({ color = "white", className = "" }: { color?: string; className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-20">
        <path d="M0,30 C360,80 720,0 1080,40 C1260,55 1380,45 1440,30 L1440,80 L0,80 Z" fill={color} />
      </svg>
    </div>
  );
}

/* ─── Brand wave symbol (pulse pattern) ──────────── */
function BrandWave({ className = "", opacity = 0.08 }: { className?: string; opacity?: number }) {
  const id = useId();
  return (
    <svg viewBox="0 0 400 100" fill="none" className={className} style={{ opacity }}>
      <defs>
        <linearGradient id={`pulseGrad${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        d="M0,50 Q50,90 100,50 Q150,10 200,50 Q250,90 300,50 Q350,10 400,50"
        stroke={`url(#pulseGrad${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function IconBadge({ icon: Icon }: { icon: ElementType }) {
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
      style={{ background: "linear-gradient(135deg, rgba(194,24,91,0.12), rgba(234,88,12,0.12))" }}
    >
      <Icon className="w-7 h-7 text-[#c2185b]" />
    </div>
  );
}

interface HomeClientProps {
  content: ContentMap;
}

export default function HomeClient({ content }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#promesse", label: t(content, "nav.link1", "Promesse") },
    { href: "#cloud-sap", label: t(content, "nav.link2", "Cloud SAP") },
    { href: "#pour-qui", label: t(content, "nav.link3", "Pour vous") },
    { href: "#methode", label: t(content, "nav.link4", "Méthode") },
    { href: "#cta", label: t(content, "nav.link5", "Contact") },
  ];

  const promesseCards = [
    {
      icon: Zap,
      title: t(content, "promesse.card1.title", "Déploiement rapide qui bat la mesure"),
      desc: t(content, "promesse.card1.desc", "SAP ERP Cloud Public en 18 semaines."),
      gradient: "from-rose-50 to-orange-50",
    },
    {
      icon: Target,
      title: t(content, "promesse.card2.title", "Standard intelligent avec de l'IA embarquée"),
      desc: t(content, "promesse.card2.desc", "IA intégrée nativement dans les applications SAP pour faciliter le pilotage de votre quotidien."),
      gradient: "from-orange-50 to-rose-50",
    },
    {
      icon: Rocket,
      title: t(content, "promesse.card3.title", "Zéro lourdeur technique"),
      desc: t(content, "promesse.card3.desc", "Tout est pensé pour aller vite, sans compromis sur la qualité ou la sécurité grâce au cloud."),
      gradient: "from-rose-50 to-orange-50",
    },
  ];

  const cloudSapCards = [
    {
      icon: Building2,
      title: t(content, "cloudSap.card1.title", "Processus métiers prêts à l'emploi"),
      desc: t(content, "cloudSap.card1.desc", "Toutes les fonctions de l'entreprise sont connectées et créent une organisation dynamique axée sur les données."),
    },
    {
      icon: RefreshCw,
      title: t(content, "cloudSap.card2.title", "Mises à jour automatiques"),
      desc: t(content, "cloudSap.card2.desc", "Toujours sur la dernière version SAP, sans effort de votre côté."),
    },
    {
      icon: Shield,
      title: t(content, "cloudSap.card3.title", "Sécurité & conformité intégrées"),
      desc: t(content, "cloudSap.card3.desc", "La puissance des modèles SaaS européens et respect du RGPD."),
    },
    {
      icon: Brain,
      title: t(content, "cloudSap.card4.title", "IA & analytics embarqués"),
      desc: t(content, "cloudSap.card4.desc", "Tableaux de bord intelligents et prédictions métiers intégrés."),
    },
  ];

  const personas = [
    {
      role: t(content, "pourQui.persona1.role", "Directeur Général"),
      icon: Briefcase,
      image: "/images/directeur-general.jpg",
      benefit: t(content, "pourQui.persona1.benefit", "Accélérez votre croissance et réduisez votre time-to-market"),
      tagline: t(content, "pourQui.persona1.tagline", "Transformez votre structure de coût en levier de croissance immédiat."),
      desc: t(content, "pourQui.persona1.desc", "Prenez une longueur d\u0027avance. Ne laissez plus votre système d\u0027information freiner votre expansion. Intégrez de nouveaux portefeuilles et lancez vos produits avec une agilité inédite."),
      points: [
        t(content, "pourQui.persona1.point1", "Vision temps réel de la performance"),
        t(content, "pourQui.persona1.point2", "Décisions basées sur la donnée"),
        t(content, "pourQui.persona1.point3", "ROI mesurable en semaines"),
      ],
    },
    {
      role: t(content, "pourQui.persona2.role", "DAF"),
      icon: BarChart3,
      image: "/images/finance-data.jpg",
      benefit: t(content, "pourQui.persona2.benefit", "Fiabilisez vos données et pilotez votre rentabilité en temps réel"),
      tagline: t(content, "pourQui.persona2.tagline", "Passez du constat à l\u0027analyse prédictive avec un standard mondial."),
      desc: t(content, "pourQui.persona2.desc", "Pilotez au scalpel. Automatisez la gestion des primes, sécurisez vos clôtures et accédez à un reporting financier en temps réel conforme aux exigences réglementaires."),
      points: [
        t(content, "pourQui.persona2.point1", "Clôtures accélérées"),
        t(content, "pourQui.persona2.point2", "Consolidation automatisée"),
        t(content, "pourQui.persona2.point3", "Conformité réglementaire intégrée"),
      ],
    },
    {
      role: t(content, "pourQui.persona3.role", "DSI"),
      icon: Monitor,
      image: "/images/tech-innovation.jpg",
      benefit: t(content, "pourQui.persona3.benefit", "Libérez-vous de la maintenance et concentrez-vous sur l\u0027innovation"),
      tagline: t(content, "pourQui.persona3.tagline", ""),
      desc: t(content, "pourQui.persona3.desc", "Innovez sans contrainte. Libérez-vous de la maintenance infrastructure. Adoptez une stratégie \u0027Clean Core\u0027 avec des mises à jour automatiques et une sécurité native."),
      points: [
        t(content, "pourQui.persona3.point1", "Zéro infrastructure à gérer"),
        t(content, "pourQui.persona3.point2", "Mises à jour automatiques SAP"),
        t(content, "pourQui.persona3.point3", "Intégrations API simplifiées"),
      ],
    },
  ];

  const trustBadges = [
    t(content, "cta.badge1", "✓ Réponse sous 24h"),
    t(content, "cta.badge2", "✓ Diagnostic offert"),
    t(content, "cta.badge3", "✓ Sans engagement"),
  ];


  return (
    <main className="font-nunito">
      <FitTextOnNowrap />
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Surfer progress indicator */}
        <div className="absolute bottom-0 left-0 right-0">
          <div
            className="absolute -top-5 transition-none"
            style={{ left: `calc(${scrollProgress * 100}% - 10px)` }}
          >
            <span className="text-2xl leading-none drop-shadow-sm" role="img" aria-label="surfeur">🏄</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#hero">
            <Image src="/logo.svg" alt="BK Pulse" width={120} height={40} className="h-10 w-auto" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            {navLinks.filter(l => l.href !== "#cta").map((link) => (
              <a key={link.href} href={link.href} className="relative hover:text-[#c2185b] transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-[#c2185b] after:to-[#ea580c] after:transition-all after:duration-300 hover:after:w-full">
                {link.label}
              </a>
            ))}
            <a
              href="#cta"
              className="px-5 py-2.5 rounded-full text-white font-bold text-sm hover:shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              {t(content, "nav.cta", "Prendre contact")}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#c2185b] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 font-semibold hover:text-[#c2185b] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setIsMenuOpen(false)}
              className="px-5 py-2.5 rounded-full text-white font-bold text-sm text-center mt-1 hover:shadow-lg transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              {t(content, "nav.cta", "Prendre contact")}
            </a>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Background photo */}
        <div className="absolute inset-0 -z-0">
          <Image
            src="/images/hero-meeting.jpg"
            alt=""
            fill
            className="object-cover object-top opacity-[0.07]"
            priority
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-0 overflow-hidden">
          <div
            className="absolute -top-[30%] -left-[15%] w-[700px] h-[700px] rounded-full opacity-[0.08] animate-drift-1"
            style={{ background: "radial-gradient(circle, #c2185b, transparent 65%)" }}
          />
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06] animate-drift-2"
            style={{ background: "radial-gradient(circle, #ea580c, transparent 65%)" }}
          />
          <div className="absolute bottom-[10%] left-0 w-[200%] animate-wave-flow">
            <BrandWave className="w-full h-auto" opacity={0.05} />
          </div>
          <div className="absolute top-[20%] left-0 w-[200%] animate-wave-flow" style={{ animationDelay: "-8s", animationDuration: "30s" }}>
            <BrandWave className="w-full h-auto" opacity={0.03} />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-36 pb-20">
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={blurUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1] tracking-tight mb-6 text-gray-900"
          >
            <Rich value={t(content, "hero.title.line1", "Donnez une nouvelle impulsion")} />{" "}
            <Rich value={t(content, "hero.title.line2", "à votre entreprise avec SAP")} />
          </motion.h1>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={blurUp}
            className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            <Rich value={t(content, "hero.subtitle", "Partenaire certifié SAP PartnerEdge SELL, BK Pulse déploie SAP en quelques semaines grâce à une méthodologie agile et efficace. Nous sommes le moteur qui propulse la solution SAP ERP Cloud Public vers les entreprises du secteur de l'assurance, des mutuelles et des courtiers avec un accès direct aux dernières innovations Cloud et IA.")} />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={blurUp}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <a
              href="#cta"
              className="px-10 py-5 rounded-full text-white font-extrabold text-lg transition-all duration-500 hover:scale-105 hero-cta-glow"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              {t(content, "hero.cta", "Prendre contact")}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">{t(content, "hero.scroll", "Scroll")}</span>
          <div className="w-5 h-8 rounded-full border-2 border-gray-300/60 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-gray-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ PROMESSE ═══════════════════ */}
      <section id="promesse" className="py-24 relative overflow-hidden bg-wave-pattern bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {(() => {
                const title = t(content, "promesse.title", "Accélérez. Simplifiez. Pilotez.");
                const highlight = t(content, "promesse.title.highlight", "Simplifiez.");
                if (!highlight || !title.includes(highlight)) {
                  return <Rich value={title} />;
                }
                const [before, ...rest] = title.split(highlight);
                const after = rest.join(highlight);
                return (
                  <>
                    <Rich value={before} />
                    <span className="gradient-brand-text"><Rich value={highlight} /></span>
                    <Rich value={after} />
                  </>
                );
              })()}
            </h2>
            <div className="text-lg text-gray-500 max-w-2xl mx-auto">
              <Rich value={t(content, "promesse.subtitle", "Trois piliers pour transformer votre déploiement ERP en avantage concurrentiel.")} />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {promesseCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className={`group relative bg-gradient-to-br ${card.gradient} border border-gray-200 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-200 cursor-default overflow-hidden`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(194,24,91,0.04), rgba(234,88,12,0.06))" }}
                />
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-rose-500/20"
                    style={{ background: "linear-gradient(135deg, rgba(194,24,91,0.12), rgba(234,88,12,0.12))" }}
                  >
                    <card.icon className="w-7 h-7 text-[#c2185b] transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-[#c2185b]">{card.title}</h3>
                  <div className="text-gray-600 leading-relaxed"><Rich value={card.desc} /></div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-500 group-hover:h-1.5"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CLOUD SAP ═══════════════════ */}
      <section id="cloud-sap" className="py-28 relative overflow-hidden bg-wave-pattern">
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-6"
                style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
              >
                {t(content, "cloudSap.badge", "Technologie SAP")}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t(content, "cloudSap.title.line1", "SAP facile")}{" "}
                <span className="gradient-brand-text">{t(content, "cloudSap.title.line2", "et accessible")}</span>
              </h2>
              <div className="text-lg text-gray-500 leading-relaxed mb-6">
                <Rich value={t(content, "cloudSap.description", "Le parcours GROW with SAP permet aux entreprises en croissance de déployer rapidement SAP. Alliez la puissance de l'intelligence artificielle aux meilleures pratiques sectorielles pour piloter votre activité avec agilité. Un déploiement maîtrisé, des processus automatisés et un soutien expert : tout est réuni pour stimuler votre innovation dès aujourd'hui.")} />
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="relative mb-8 rounded-2xl overflow-hidden shadow-lg"
              >
                <Image
                  src="/images/team-collaboration.jpg"
                  alt="Équipe BK Pulse en collaboration"
                  width={600}
                  height={340}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-white font-bold text-sm"><Rich value={t(content, "cloudSap.team.title", "Équipe certifiée SAP")} /></div>
                  <div className="text-white/80 text-xs"><Rich value={t(content, "cloudSap.team.subtitle", "Experts assurance, mutuelles & courtage")} /></div>
                </div>
              </motion.div>

              <a
                href="#cta"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold hover:shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
              >
                {t(content, "cloudSap.cta", "En savoir plus →")}
              </a>
            </motion.div>

            <div className="grid grid-cols-2 gap-5">
              {cloudSapCards.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    custom={i}
                    variants={fadeUp}
                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                      style={{ background: "linear-gradient(135deg, rgba(194,24,91,0.12), rgba(234,88,12,0.12))" }}
                    >
                      <Icon className="w-6 h-6 text-[#c2185b]" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-gray-500 text-sm leading-relaxed"><Rich value={item.desc} /></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ POUR QUI ═══════════════════ */}
      <section
        id="pour-qui"
        className="py-20 relative overflow-hidden bg-wave-pattern bg-gray-50/60"
      >
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {t(content, "pourQui.title.line1", "Une approche pensée")}{" "}
              <span className="gradient-brand-text">{t(content, "pourQui.title.line2", "pour vos enjeux")}</span>
            </h2>
            <div className="text-lg text-gray-500 max-w-4xl mx-auto">
              <Rich value={t(content, "pourQui.subtitle", "Quel que soit votre rôle, SAP ERP Cloud Public vous apporte des réponses concrètes.")} />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {personas.map((item, i) => (
              <motion.div
                key={item.role}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={item.image}
                    alt={item.role}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>
                <div className="px-8 pt-4 pb-8">
                <IconBadge icon={item.icon} />
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-4"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  {item.role}
                </div>
                <div className="text-gray-800 font-bold text-lg leading-snug mb-2">
                  <Rich value={item.benefit} />
                </div>
                {item.tagline && (
                  <div className="text-[#c2185b] font-semibold text-sm mb-3"><Rich value={item.tagline} /></div>
                )}
                {item.desc && (
                  <div className="text-gray-500 text-sm leading-relaxed mb-5"><Rich value={item.desc} /></div>
                )}
                <ul className="space-y-2">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="mt-0.5 text-[#c2185b] font-bold shrink-0">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MÉTHODE ═══════════════════ */}
      <section id="methode" className="relative overflow-hidden">
        <div className="relative">
          <div className="relative h-[320px] md:h-[420px] overflow-hidden">
            <Image
              src="/images/surfeuse.jpg"
              alt="Surfez sur la vague de la transformation"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className="max-w-6xl mx-auto px-6 w-full"
              >
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-4"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  {t(content, "methode.badge", "La méthode BK Pulse")}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight max-w-lg">
                  {t(content, "methode.title.line1", "Votre ERP déployé en")}{" "}
                  <span className="gradient-text-animated">{t(content, "methode.title.highlight", "18 semaines")}</span>
                </h2>
                <div className="text-white/70 text-lg max-w-md">
                  <Rich value={t(content, "methode.subtitle", "Pas de tunnel projet. Pas de complexité inutile. Juste de l'efficacité.")} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA FINAL ═══════════════════ */}
      <section id="cta" className="pt-32 pb-0 relative overflow-hidden bg-wave-pattern bg-gray-50/60">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.05) 0%, rgba(234,88,12,0.05) 100%)",
          }}
        />
        <div
          className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, #c2185b, transparent)" }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            {t(content, "cta.title.line1", "Et si votre ERP devenait enfin")}{" "}
            <span className="gradient-brand-text">{t(content, "cta.title.line2", "un levier de croissance\u00a0?")}</span>
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={1}
            variants={fadeUp}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            <Rich value={t(content, "cta.subtitle", "Évaluez votre éligibilité à un déploiement rapide en 15 minutes. Notre équipe d'experts vous accompagne à chaque étape.")} />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={2}
            variants={fadeUp}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="border border-gray-200 rounded-3xl bg-white shadow-lg p-8 md:p-12">
              <div className="rounded-2xl overflow-hidden mb-8">
                <TypeformWidget
                  id={t(content, "cta.typeformId", "kMV1RSpR")}
                  style={{ width: "100%", height: "500px" }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap gap-6 justify-center text-sm text-gray-500"
          >
            {trustBadges.map((item) => (
              <span key={item} className="font-semibold">{item}</span>
            ))}
          </motion.div>

          {/* Windsurf silhouette — transition vers le footer */}
          <div className="flex justify-center py-32 md:py-40" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/windsurfer.png"
              alt=""
              className="h-12 md:h-14 w-auto opacity-90 select-none"
              draggable={false}
            />
          </div>
        </div>

      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-wave-pattern bg-gray-50/60 py-14 text-gray-700 relative">
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.05) 0%, rgba(234,88,12,0.05) 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 md:gap-8 mb-8">
            <div className="flex flex-col items-start gap-2 min-w-0">
              <Image
                src="/logo.svg"
                alt="BK Pulse"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
              <div className="text-sm text-gray-600 leading-relaxed">
                <Rich value={t(content, "footer.description", "Partenaire SAP dédié à la performance des PME")} />
              </div>
              <div className="text-sm text-gray-600">
                <Rich value={t(content, "footer.group", "Filiale de BK Groupe")} />
              </div>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed text-left">
              <Rich value={t(content, "footer.address", "Tour Landscape,<br>6 Pl. des Degrés, 92800 Puteaux")} />
            </div>
            <a
              href={`mailto:${t(content, "footer.contact.email", "contact@bkpartners.fr")}`}
              className="text-sm text-gray-700 hover:text-[#c2185b] transition-colors text-left"
            >
              {t(content, "footer.contact.email", "contact@bkpartners.fr")}
            </a>
            <a
              href={t(content, "footer.linkedin", "https://www.linkedin.com/company/bkpulse/about")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-[#c2185b] transition-colors font-medium text-left md:text-right"
            >
              LinkedIn
            </a>
          </div>

          <div className="border-t border-gray-300/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>{t(content, "footer.copyright", `© ${new Date().getFullYear()} BK Pulse — BK Partners Group. Tous droits réservés.`)}</p>
            <div className="flex gap-6">
              <a href="/mentions-legales" className="hover:text-[#c2185b] transition-colors">Mentions légales</a>
              <a href="/politique-de-confidentialite" className="hover:text-[#c2185b] transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
