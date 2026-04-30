"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Itens de navegação centralizados
const NAV_ITEMS = [
  { href: "#team",     label: "A Equipe"   },
  { href: "#benefits", label: "Benefícios" },
  { href: "#athletes", label: "Atletas"    },
];

const Header = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // ── Scroll Spy (item 9) ─────────────────────────────────────────────────
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((n) => n.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        // O root é o elemento com overflow-y-auto (main-scroll)
        root: document.getElementById("main-scroll"),
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logos/logo_transparent.png"
            alt="The Grinders Logo"
            width={140}
            height={30}
            className="object-contain"
          />
        </Link>

        {/* ── Nav Desktop ───────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative font-medium transition-colors ${
                activeSection === item.href
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {item.label}
              {/* Sublinhado ativo */}
              {activeSection === item.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-600 rounded-full"
                />
              )}
            </a>
          ))}
        </nav>

        {/* ── Botões CTA (desktop) ──────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/signup"
            className="border-neutral-700 hover:border-white text-white hover:bg-white/10 border-[0.5px] px-6 py-3 rounded-md font-bold transition-colors text-sm"
          >
            Cadastrar
          </Link>
          <Link
            href="/login"
            className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-md font-bold transition-colors text-sm"
          >
            Entrar
          </Link>
        </div>

        {/* ── Botão Hamburger (mobile) ──────────────────────────────────── */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Menu Mobile (item 1) ─────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-neutral-950 border-b border-neutral-800"
          >
            <nav className="flex flex-col px-4 py-4 gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeSection === item.href
                      ? "bg-red-700/20 text-white border border-red-700/40"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              ))}

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-neutral-800">
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-center border border-neutral-700 text-white hover:bg-white/10 px-6 py-3 rounded-md font-bold transition-colors text-sm"
                >
                  Cadastrar
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-md font-bold transition-colors text-sm"
                >
                  Entrar
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
