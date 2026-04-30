// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TeamProof from "@/components/landing/TeamProof";
import FoundersStory from "@/components/landing/FounderStory";
import Benefits from "@/components/landing/Benefits";
import Athletes from "@/components/landing/Athletes";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

function SectionGradient({ from, to }: { from: string; to: string }) {
  return (
    <div
      className={`h-16 bg-gradient-to-b from-${from} to-${to} pointer-events-none select-none`}
      aria-hidden="true"
    />
  );
}

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

  // Enquanto detecta o modo (evita flash da landing no PWA).
  // No PWA isso aparece por ~1s antes de ir para /login → dashboard.
  if (!ready) {
    return (
      <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center gap-8">
        <div className="animate-pulse">
          <Image
            src="/icons/icon-192x192.png"
            alt="The Grinders"
            width={96}
            height={96}
            className="rounded-2xl shadow-2xl shadow-red-950/60"
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-2xl font-black tracking-widest text-white">
            THE GRINDERS
          </span>
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="main-scroll"
      className="h-screen w-full overflow-y-auto overflow-x-hidden bg-neutral-950 text-white selection:bg-red-700 selection:text-white scroll-smooth"
    >
      <Header />

      <main>
        <Hero />

        <SectionGradient from="neutral-950" to="neutral-900" />

        <div id="team">
          <TeamProof />
        </div>

        <SectionGradient from="neutral-900" to="neutral-950" />

        <FoundersStory />

        <SectionGradient from="neutral-950" to="neutral-900" />

        <div id="benefits">
          <Benefits />
        </div>

        <SectionGradient from="neutral-900" to="neutral-950" />

        <div id="athletes">
          <Athletes />
        </div>

        <div
          className="h-20 pointer-events-none select-none"
          style={{ background: "linear-gradient(to bottom, rgb(10,10,10), rgb(185,28,28))" }}
          aria-hidden="true"
        />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
