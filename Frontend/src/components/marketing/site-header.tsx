"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/marketing/brand";
import { navigationItems } from "@/lib/marketing-content";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`mc-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="mc-container mc-header__inner">
        <Brand />

        <nav className="mc-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} className="mc-nav__link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mc-header__actions">
          <Link className="mc-text-link" href="/login">Sign in</Link>
          <Link className="mc-button mc-button--small" href="/register">
            Get started <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <button
          className="mc-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mc-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mc-mobile-nav" id="mc-mobile-nav" aria-label="Mobile navigation">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu} className="mc-mobile-nav__link">
              {item.label}
            </a>
          ))}
          <div className="mc-mobile-nav__actions">
            <Link className="mc-button mc-button--outline" href="/login" onClick={closeMenu}>Sign in</Link>
            <Link className="mc-button" href="/register" onClick={closeMenu}>Get started <ArrowRight size={15} /></Link>
          </div>
        </nav>
      )}
    </header>
  );
}
