"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages?: string; autoDisplay?: boolean },
          element: string,
        ) => void;
      };
    };
  }
}

const SCRIPT_SRC =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

/* Charge le widget Google Translate par injection manuelle du script.
 *
 * Pourquoi pas <Script> de next/script ? En production, la balise était bien
 * présente dans le DOM mais `element.js` ne s'exécutait jamais (google.translate
 * restait indéfini → widget jamais monté → toggle FR/EN sans effet). Le même
 * script chargé manuellement via document.createElement fonctionne. On reproduit
 * donc ce chargement manuel ici, en définissant le callback d'init AVANT
 * d'injecter le script (element.js l'appelle via ?cb=). */

/* Filet de sécurité : Google Translate ré-injecte son bandeau (iframe en haut)
 * et décale le <body> après chaque traduction, parfois avec des noms de classe
 * obfusqués que le CSS ne couvre pas. On le masque donc aussi en JS. */
function hideGoogleTranslateChrome() {
  if (document.body.style.top !== "0px") document.body.style.top = "0px";
  document
    .querySelectorAll<HTMLElement>("iframe.skiptranslate, .goog-te-banner-frame")
    .forEach((el) => {
      el.style.display = "none";
    });
}

export default function GoogleTranslate() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "fr", includedLanguages: "en,fr", autoDisplay: false },
          "google_translate_element",
        );
      }
    };

    if (!document.querySelector("script[data-gtranslate]")) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute("data-gtranslate", "1");
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      // Script déjà chargé (navigation client) : (ré)initialise le widget.
      window.googleTranslateElementInit();
    }

    // Masque le bandeau dès qu'il (ré)apparaît dans le DOM.
    hideGoogleTranslateChrome();
    const observer = new MutationObserver(hideGoogleTranslateChrome);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}
