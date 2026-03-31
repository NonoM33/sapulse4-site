"use client";

import Image from "next/image";
import { useState, useId, useEffect, type ElementType } from "react";
import { motion, type Variants, type Easing } from "framer-motion";
import dynamic from "next/dynamic";
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

const navLinks = [
  { href: "#promesse", label: "Notre promesse" },
  { href: "#cloud-sap", label: "Cloud SAP" },
  { href: "#pour-qui", label: "SAP Pour vous" },
];

export default function Home() {
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

  return (
    <main className="font-nunito">
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
            <Image src="/logo.png" alt="BK Pulse" width={120} height={40} className="h-10 w-auto" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-[#c2185b] transition-colors">
                {link.label}
              </a>
            ))}
            <a
              href="#cta"
              className="px-5 py-2 rounded-full text-white font-bold text-sm hover:shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              Prendre contact
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
              Prendre contact
            </a>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-0 overflow-hidden">
          {/* Large soft gradient circle — top left (like brand charter) */}
          <div
            className="absolute -top-[30%] -left-[15%] w-[700px] h-[700px] rounded-full opacity-[0.08] animate-drift-1"
            style={{ background: "radial-gradient(circle, #c2185b, transparent 65%)" }}
          />
          {/* Orange accent — bottom right */}
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06] animate-drift-2"
            style={{ background: "radial-gradient(circle, #ea580c, transparent 65%)" }}
          />

          {/* Flowing wave pattern — continuous animation */}
          <div className="absolute bottom-[10%] left-0 w-[200%] animate-wave-flow">
            <BrandWave className="w-full h-auto" opacity={0.05} />
          </div>
          <div className="absolute top-[20%] left-0 w-[200%] animate-wave-flow" style={{ animationDelay: "-8s", animationDuration: "30s" }}>
            <BrandWave className="w-full h-auto" opacity={0.03} />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-36 pb-20">
          {/* Main headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={blurUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1] tracking-tight mb-6 text-gray-900"
          >
            Donnez une nouvelle impulsion
            <br />
            <span className="gradient-text-animated">à votre entreprise avec SAP</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={blurUp}
            className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            Partenaire certifié SAP PartnerEdge SELL, BK Pulse déploie SAP en <span className="text-gray-800 font-semibold">quelques semaines</span> grâce à une méthodologie agile et efficace.
            Nous sommes le moteur qui propulse la solution SAP ERP Cloud Public vers les entreprises du secteur de l&apos;assurance, des mutuelles et des courtiers avec un accès direct aux dernières innovations Cloud et IA.
          </motion.p>

          {/* CTA — gros boutons */}
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
              Prendre contact
            </a>
            <a
              href="#methode"
              className="px-10 py-5 rounded-full text-gray-600 font-semibold text-lg border-2 border-gray-200 hover:border-[#c2185b] hover:text-[#c2185b] transition-all duration-300"
            >
              Découvrir la méthode →
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Scroll</span>
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
      <section id="promesse" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative wave bg */}
        <BrandWave className="absolute top-12 -right-20 w-[500px] h-auto rotate-12" opacity={0.04} />

        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Accélérez.{" "}
              <span className="gradient-brand-text">Simplifiez.</span>{" "}
              Pilotez.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Trois piliers pour transformer votre déploiement ERP en avantage concurrentiel.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Déploiement rapide qui bat la mesure",
                desc: "SAP ERP Cloud Public en 18 semaines.",
                gradient: "from-rose-50 to-orange-50",
              },
              {
                icon: Target,
                title: "Standard intelligent avec de l'IA embarquée",
                desc: "IA intégrée nativement dans les applications SAP pour faciliter le pilotage de votre quotidien.",
                gradient: "from-orange-50 to-rose-50",
              },
              {
                icon: Rocket,
                title: "Zéro lourdeur technique",
                desc: "Tout est pensé pour aller vite, sans compromis sur la qualité ou la sécurité grâce au cloud.",
                gradient: "from-rose-50 to-orange-50",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className={`relative bg-gradient-to-br ${card.gradient} border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <IconBadge icon={card.icon} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CLOUD SAP ═══════════════════ */}
      <section id="cloud-sap" className="py-28 bg-white relative overflow-hidden">
        <BrandWave className="absolute top-20 -right-32 w-[500px] h-auto rotate-6" opacity={0.04} />

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
                Technologie SAP
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                SAP facile{" "}
                <span className="gradient-brand-text">et accessible</span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8">
                Le parcours GROW with SAP permet aux entreprises en croissance de déployer rapidement SAP.
                Alliez la puissance de l&apos;intelligence artificielle aux meilleures pratiques sectorielles
                pour piloter votre activité avec agilité. Un déploiement maîtrisé, des processus automatisés
                et un soutien expert : tout est réuni pour stimuler votre innovation dès aujourd&apos;hui.
              </p>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold hover:shadow-lg hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
              >
                En savoir plus →
              </a>
            </motion.div>

            <div className="grid grid-cols-2 gap-5">
              {[
                {
                  icon: Building2,
                  title: "Processus métiers prêts à l'emploi",
                  desc: "Toutes les fonctions de l'entreprise sont connectées et créent une organisation dynamique axée sur les données.",
                },
                {
                  icon: RefreshCw,
                  title: "Mises à jour automatiques",
                  desc: "Toujours sur la dernière version SAP, sans effort de votre côté.",
                },
                {
                  icon: Shield,
                  title: "Sécurité & conformité intégrées",
                  desc: "La puissance des modèles SaaS européens et respect du RGPD.",
                },
                {
                  icon: Brain,
                  title: "IA & analytics embarqués",
                  desc: "Tableaux de bord intelligents et prédictions métiers intégrés.",
                },
              ].map((item, i) => {
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
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
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
        className="py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(194,24,91,0.04) 0%, rgba(234,88,12,0.04) 100%)",
        }}
      >
        <BrandWave className="absolute bottom-20 -left-16 w-[400px] h-auto -rotate-6" opacity={0.05} />

        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Une approche pensée{" "}
              <span className="gradient-brand-text">pour vos enjeux</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Quel que soit votre rôle, SAP ERP Cloud Public vous apporte des réponses concrètes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                role: "Directeur Général",
                icon: Briefcase,
                benefit: "Accélérez votre croissance et réduisez votre time-to-market",
                desc: "Prenez une longueur d\u0027avance. Ne laissez plus votre système d\u0027information freiner votre expansion. Intégrez de nouveaux portefeuilles et lancez vos produits avec une agilité inédite.",
                points: [
                  "Vision temps réel de la performance",
                  "Décisions basées sur la donnée",
                  "ROI mesurable en semaines",
                ],
              },
              {
                role: "DAF",
                icon: BarChart3,
                benefit: "Fiabilisez vos données et pilotez votre rentabilité en temps réel",
                desc: "Pilotez au scalpel. Automatisez la gestion des primes, sécurisez vos clôtures et accédez à un reporting financier en temps réel conforme aux exigences réglementaires.",
                points: [
                  "Clôtures accélérées",
                  "Consolidation automatisée",
                  "Conformité réglementaire intégrée",
                ],
              },
              {
                role: "DSI",
                icon: Monitor,
                benefit: "Libérez-vous de la maintenance et concentrez-vous sur l\u0027innovation",
                desc: "Innovez sans contrainte. Libérez-vous de la maintenance infrastructure. Adoptez une stratégie \u0027Clean Core\u0027 avec des mises à jour automatiques et une sécurité native.",
                points: [
                  "Zéro infrastructure à gérer",
                  "Mises à jour automatiques SAP",
                  "Intégrations API simplifiées",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={item.role}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <IconBadge icon={item.icon} />
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-4"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  {item.role}
                </div>
                <p className="text-gray-800 font-bold text-lg leading-snug mb-3">
                  {item.benefit}
                </p>
                {item.desc && (
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                )}
                <ul className="space-y-2">
                  {item.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="mt-0.5 text-[#c2185b] font-bold shrink-0">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ METHODE ═══════════════════ */}
      <section
        id="methode"
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fdf2f3 0%, #fef7f0 50%, #ffffff 100%)" }}
      >
        {/* Decorative waves */}
        <BrandWave className="absolute top-16 -left-20 w-[400px] h-auto rotate-[-8deg]" opacity={0.06} />
        <BrandWave className="absolute bottom-10 -right-16 w-[350px] h-auto rotate-[12deg]" opacity={0.04} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-6"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              Notre méthode
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              La méthode{" "}
              <span className="gradient-brand-text">BK Pulse</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Pas de tunnel projet. Pas de complexité inutile. Juste de l&apos;efficacité.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Animated connector line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="hidden md:block absolute top-10 left-0 right-0 h-0.5 mx-16 origin-left"
              style={{ background: "linear-gradient(90deg, #c2185b, #ea580c)" }}
            />

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  title: "Diagnostic",
                  desc: "Analyse de vos processus actuels, identification des quick-wins et définition du périmètre optimal.",
                  duration: "1-2 semaines",
                },
                {
                  step: "02",
                  title: "Configuration agile",
                  desc: "Paramétrage itératif basé sur les best practices secteur. Validation à chaque sprint avec vos équipes.",
                  duration: "4-14 semaines",
                },
                {
                  step: "03",
                  title: "Go-Live",
                  desc: "Mise en production accompagnée, formation des utilisateurs et suivi post-démarrage garantis.",
                  duration: "18 semaines total",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={i}
                  variants={fadeUp}
                  className="text-center relative"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-6 shadow-xl relative z-10"
                    style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, rgba(194,24,91,0.1), rgba(234,88,12,0.1))", color: "#c2185b" }}
                  >
                    {item.duration}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA FINAL ═══════════════════ */}
      <section id="cta" className="py-32 bg-white relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.03) 0%, rgba(234,88,12,0.03) 100%)",
          }}
        />
        {/* Decorative waves */}
        <BrandWave className="absolute top-10 -left-20 w-[400px] h-auto -rotate-3" opacity={0.04} />
        <BrandWave className="absolute bottom-16 -right-16 w-[350px] h-auto rotate-6" opacity={0.03} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-3xl mx-auto px-6 relative"
        >
          <div className="border border-gray-200 rounded-3xl bg-white shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight text-center">
              Votre ERP déployé en{" "}
              <span className="gradient-brand-text">18 semaines.</span>
            </h2>

            <p className="text-lg text-gray-500 mb-8 text-center">
              Parlons de votre projet ERP.
            </p>

            {/* Typeform embed */}
            <div className="rounded-2xl overflow-hidden mb-8">
              <TypeformWidget
                id="kMV1RSpR"
                style={{ width: "100%", height: "500px" }}
              />
            </div>

            <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
              {["✓ Réponse sous 24h", "✓ Diagnostic offert", "✓ Sans engagement"].map((item) => (
                <span key={item} className="font-semibold">{item}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Wave before footer */}
      <WaveSeparatorSolid color="#1a0a10" />

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer
        className="py-16 text-white"
        style={{ background: "linear-gradient(135deg, #1a0a10 0%, #1a0e06 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <Image
                src="/logo.png"
                alt="BK Pulse"
                width={120}
                height={40}
                className="h-10 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                BK Pulse — Cabinet de conseil ERP Cloud SAP spécialisé assurance, mutuelles et courtage.
              </p>
              <p className="text-gray-500 text-xs mt-3">Membre de BK Partners Group</p>
            </div>

            <div>
              <h4 className="font-extrabold text-white mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {[
                  { href: "#promesse", label: "Notre promesse" },
                  { href: "#cloud-sap", label: "Cloud SAP" },
                  { href: "#pour-qui", label: "SAP Pour vous" },
                  { href: "#cta", label: "Contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-[#ea580c] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:contact@bkpartners.fr" className="hover:text-[#ea580c] transition-colors">
                    contact@bkpartners.fr
                  </a>
                </li>
                <li className="text-gray-500 text-xs mt-4">
                  SAP, SAP S/4HANA sont des marques déposées de SAP SE.
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 BK Pulse — BK Partners Group. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
