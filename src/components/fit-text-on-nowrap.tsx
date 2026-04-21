"use client";

import { useEffect } from "react";

/**
 * Scans the DOM for every element tagged `data-nowrap="true"` and shrinks
 * its font-size just enough so the text fits on a single line inside its
 * parent. Re-runs on any resize or DOM mutation, so the nowrap fields
 * stay readable on all viewports.
 */
export function FitTextOnNowrap() {
  useEffect(() => {
    const MIN_FONT_PX = 10;

    function fitOne(el: HTMLElement) {
      const parent = el.parentElement;
      if (!parent) return;

      // Reset any previous inline font-size so we measure the natural size.
      el.style.fontSize = "";

      const parentWidth = parent.clientWidth;
      const textWidth = el.scrollWidth;
      if (parentWidth <= 0 || textWidth <= 0) return;
      if (textWidth <= parentWidth) return; // already fits

      const baseFontSize = parseFloat(window.getComputedStyle(el).fontSize);
      if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) return;

      const scale = parentWidth / textWidth;
      const next = Math.max(baseFontSize * scale * 0.98, MIN_FONT_PX);
      el.style.fontSize = `${next}px`;
    }

    function fitAll() {
      const nodes = document.querySelectorAll<HTMLElement>('[data-nowrap="true"]');
      nodes.forEach(fitOne);
    }

    fitAll();

    const ro = new ResizeObserver(() => fitAll());
    ro.observe(document.body);

    const mo = new MutationObserver(() => fitAll());
    mo.observe(document.body, { subtree: true, childList: true, characterData: true });

    window.addEventListener("resize", fitAll);
    window.addEventListener("load", fitAll);
    document.fonts?.ready.then(() => fitAll());

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", fitAll);
      window.removeEventListener("load", fitAll);
    };
  }, []);

  return null;
}
