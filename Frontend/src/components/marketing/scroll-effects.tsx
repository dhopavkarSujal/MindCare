"use client";

import { useEffect } from "react";

/** Adds scroll reveal effects progressively, without hiding content when JS is unavailable. */
export function ScrollEffects() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".mc-page");
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!page || targets.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    page.classList.add("mc-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -42px 0px" },
    );

    targets.forEach((target) => {
      const delay = target.dataset.revealDelay;
      if (delay) target.style.setProperty("--reveal-delay", `${Math.min(Number(delay), 420)}ms`);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
