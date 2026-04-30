"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  // ── Parallax no scroll (item 8) ─────────────────────────────────────────
  useEffect(() => {
    const scroller = document.getElementById("main-scroll");
    if (!scroller) return;

    const handleScroll = () => {
      setOffsetY(scroller.scrollTop * 0.35); // 35 % da velocidade = efeito sutil
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">

      {/* ── Imagem de Fundo com Parallax ─────────────────────────────────── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY}px)`, willChange: "transform" }}
      >
        <Image
          src="/images/team/hero-background.jpg"
          alt="Powerlifter training"
          fill
          className="object-cover w-full h-full opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/50 to-neutral-950" />
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-8xl font-black font-serif mb-6 tracking-tight text-white drop-shadow-2xl"
        >
          FORJE A SUA
          <span className="block text-red-700 mt-2">FORÇA.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto mb-12 font-light"
        >
          O aplicativo de treino definitivo, criado pela equipe The Grinders.<br />
          Chega de planilhas. Apenas resultados.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="https://wa.me/554199592555"
            className="bg-red-700 hover:bg-red-600 text-white text-lg px-8 py-4 rounded-lg font-bold transition-all hover:scale-105 shadow-lg shadow-red-900/30"
          >
            Seja um Grinder
          </Link>
          <Link
            href="https://wa.me/554199592555"
            className="border-2 border-neutral-700 hover:border-white text-white hover:bg-white/10 text-lg px-8 py-4 rounded-lg font-bold transition-all"
          >
            Se torne um Coach
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll Indicator animado (item 5) ───────────────────────────── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="text-xs tracking-widest uppercase font-medium">Role para baixo</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} className="text-red-600" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
