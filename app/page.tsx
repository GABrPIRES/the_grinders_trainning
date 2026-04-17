// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TeamProof from "@/components/landing/TeamProof";
import FoundersStory from "@/components/landing/FounderStory";
import Benefits from "@/components/landing/Benefits";
import Athletes from "@/components/landing/Athletes";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Detecta se está rodando como PWA instalado (standalone / fullscreen).
    // Se sim, redireciona para /login (o middleware lida com o caso de já estar autenticado).
    // Isso impede que a landing page apareça no app instalado.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  // Enquanto detecta o modo (evita flash da landing no PWA)
  if (!ready) {
    return (
      <div className="h-screen w-full bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-neutral-950 text-white selection:bg-red-700 selection:text-white scroll-smooth">
      <Header />
      <main>
        <Hero />
        <div id="team">
          <TeamProof />
        </div>
        <FoundersStory />
        <div id="benefits">
          <Benefits />
        </div>
        <div id="athletes">
          <Athletes />
        </div>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}