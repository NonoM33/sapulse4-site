"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "bkpulse_cookie_consent";

type ConsentStatus = "pending" | "accepted" | "refused";

function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? "pending";
}

function setConsent(status: "accepted" | "refused") {
  localStorage.setItem(CONSENT_KEY, status);

  if (status === "accepted" && typeof window !== "undefined" && window.op) {
    window.op("event", "consent_granted");
  }
}

// Extend window for OpenPanel
declare global {
  interface Window {
    op?: (...args: unknown[]) => void;
  }
}

export default function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>("accepted"); // default hidden
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStatus(getConsent());
  }, []);

  if (!mounted || status !== "pending") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Nous respectons votre vie privée</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ce site utilise des cookies d&apos;analyse pour mesurer l&apos;audience et améliorer votre
            expérience. Aucune donnée personnelle n&apos;est partagée avec des tiers.
            Vos données sont hébergées en Europe.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setConsent("refused");
              setStatus("refused");
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-all"
          >
            Refuser
          </button>
          <button
            onClick={() => {
              setConsent("accepted");
              setStatus("accepted");
            }}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-rose-500/20 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
