"use client";

import Image from "next/image";
import { useState, type ElementType } from "react";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  Zap, Target, Rocket,
  Briefcase, BarChart3, Monitor,
  Building2, RefreshCw, Shield, Brain,
  Menu, X, ChevronDown,
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
  { href: "#pour-qui", label: "Pour qui" },
  { href: "#cloud-sap", label: "Cloud SAP" },
  { href: "#methode", label: "Méthode" },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="font-nunito">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
              Évaluer mon éligibilité
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
              Évaluer mon éligibilité
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.06) 0%, rgba(234,88,12,0.06) 50%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Decorative blobs with floating animation */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 -z-10 blur-3xl animate-float"
          style={{ background: "radial-gradient(circle, #c2185b, transparent)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 -z-10 blur-3xl animate-float-slow"
          style={{ background: "radial-gradient(circle, #ea580c, transparent)" }}
        />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-6">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-8"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              BK Partners Group
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-gray-900"
          >
            L&apos;ERP qui va{" "}
            <span className="gradient-brand-text">à votre rythme</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4"
          >
            Transformez votre entreprise en quelques semaines, pas en 18 mois.{" "}
            <strong className="text-gray-800">BK Pulse</strong> réinvente le déploiement ERP
            pour les acteurs de l&apos;assurance, des mutuelles et du courtage.
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-12"
          >
            Notre promesse&nbsp;: vous offrir la puissance d&apos;un ERP Cloud standard,
            avec la rapidité et l&apos;agilité dont votre business a réellement besoin.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#cta"
              className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              Évaluez votre éligibilité
            </a>
            <a
              href="#methode"
              className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-[#c2185b] hover:text-[#c2185b] transition-all duration-300"
            >
              Découvrir la méthode →
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: "8 sem.", label: "Déploiement moyen" },
              { value: "100%", label: "Cloud natif SAP" },
              { value: "0", label: "Maintenance IT" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-2 ${i > 0 ? "sm:border-l sm:border-gray-200" : ""}`}
              >
                <div className="text-3xl font-extrabold gradient-brand-text">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      </section>

      {/* PROMESSE */}
      <section id="promesse" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
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
                title: "Déploiement rapide",
                desc: "Un socle opérationnel en quelques semaines. Pas de tunnel projet, pas d'attente interminable.",
                gradient: "from-rose-50 to-orange-50",
                border: "border-rose-100",
              },
              {
                icon: Target,
                title: "Standard intelligent",
                desc: "Basé sur les meilleures pratiques du marché assurance/mutuelles. Prêt à l'emploi, immédiatement efficace.",
                gradient: "from-orange-50 to-rose-50",
                border: "border-orange-100",
              },
              {
                icon: Rocket,
                title: "Zéro lourdeur technique",
                desc: "Tout est pensé pour aller vite, sans compromis sur la qualité ou la sécurité.",
                gradient: "from-rose-50 to-orange-50",
                border: "border-rose-100",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className={`relative bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
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

      {/* POUR QUI */}
      <section
        id="pour-qui"
        className="py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(194,24,91,0.04) 0%, rgba(234,88,12,0.04) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
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
              Quel que soit votre rôle, BK Pulse vous apporte des réponses concrètes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                role: "Dirigeants",
                icon: Briefcase,
                benefit: "Accélérez votre croissance et réduisez votre time-to-market",
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
                points: [
                  "Clôtures accélérées",
                  "Consolidation automatisée",
                  "Conformité réglementaire intégrée",
                ],
              },
              {
                role: "DSI",
                icon: Monitor,
                benefit: "Libérez-vous de la maintenance et concentrez-vous sur l'innovation",
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
                <p className="text-gray-800 font-bold text-lg leading-snug mb-5">
                  {item.benefit}
                </p>
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

      {/* CLOUD SAP */}
      <section id="cloud-sap" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
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
                Le Cloud SAP,{" "}
                <span className="gradient-brand-text">sans la complexité</span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-8">
                Profitez de toute la puissance de SAP S/4HANA Cloud, déployé et configuré
                par des experts qui connaissent votre secteur sur le bout des doigts.
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
                  desc: "Configurés pour l'assurance et la mutuelle dès le premier jour.",
                },
                {
                  icon: RefreshCw,
                  title: "Mises à jour automatiques",
                  desc: "Toujours sur la dernière version SAP, sans effort de votre côté.",
                },
                {
                  icon: Shield,
                  title: "Sécurité & conformité intégrées",
                  desc: "Conformité RGPD, DDA et réglementations assurancielles natives.",
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

      {/* METHODE */}
      <section
        id="methode"
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0a10 0%, #1a0e06 100%)" }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl -z-0 animate-float"
          style={{ background: "radial-gradient(circle, #c2185b, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl -z-0 animate-float-slow"
          style={{ background: "radial-gradient(circle, #ea580c, transparent)" }}
        />

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
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              La méthode{" "}
              <span className="gradient-brand-text">BK Pulse</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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
                  duration: "4-6 semaines",
                },
                {
                  step: "03",
                  title: "Go-Live",
                  desc: "Mise en production accompagnée, formation des utilisateurs et suivi post-démarrage garantis.",
                  duration: "En quelques semaines",
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
                  <h3 className="text-2xl font-extrabold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{item.desc}</p>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 border border-white/20">
                    {item.duration}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta" className="py-32 bg-white relative overflow-hidden">
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
            Et si votre ERP devenait enfin{" "}
            <span className="gradient-brand-text">un levier de croissance&nbsp;?</span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={1}
            variants={fadeUp}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Évaluez votre éligibilité à un déploiement rapide en 15 minutes.
            Notre équipe d&apos;experts vous accompagne à chaque étape.
          </motion.p>

          {/* Contact form */}
          <motion.form
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={2}
            variants={fadeUp}
            onSubmit={(e) => e.preventDefault()}
            className="max-w-xl mx-auto mb-10 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Votre nom"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/30 focus:border-[#c2185b] text-gray-800 bg-white"
              />
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/30 focus:border-[#c2185b] text-gray-800 bg-white"
              />
            </div>
            <input
              type="tel"
              placeholder="Votre téléphone"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/30 focus:border-[#c2185b] text-gray-800 bg-white mb-4"
            />
            <textarea
              placeholder="Décrivez votre besoin en quelques mots..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/30 focus:border-[#c2185b] text-gray-800 bg-white mb-4 resize-none"
            />
            <button
              type="submit"
              className="w-full px-8 py-4 rounded-full text-white font-extrabold text-lg shadow-xl hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              Évaluer mon éligibilité →
            </button>
          </motion.form>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap gap-6 justify-center text-sm text-gray-500"
          >
            {["✓ Réponse sous 24h", "✓ Diagnostic offert", "✓ Sans engagement"].map((item) => (
              <span key={item} className="font-semibold">{item}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CREDIBILITE */}
      <section className="py-20 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeIn}
            className="text-center"
          >
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-12 block">
              Ils nous font confiance
            </span>
            <blockquote className="relative">
              <div
                className="text-8xl font-serif leading-none opacity-10 mb-2"
                style={{ color: "#c2185b" }}
              >
                &ldquo;
              </div>
              <p className="text-xl md:text-2xl text-gray-700 font-medium italic leading-relaxed max-w-2xl mx-auto mb-10">
                Grâce à BK Pulse, nous avons mis en production notre ERP en 7 semaines.
                Une équipe exceptionnelle, une méthode rodée. Exactement ce dont nous avions besoin.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-lg shrink-0"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  SM
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">Sophie Martin</div>
                  <div className="text-sm text-gray-500">DAF — Mutuelle Avenir Santé</div>
                </div>
              </div>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
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
                  { href: "#pour-qui", label: "Pour qui" },
                  { href: "#cloud-sap", label: "Cloud SAP" },
                  { href: "#methode", label: "Méthode" },
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
