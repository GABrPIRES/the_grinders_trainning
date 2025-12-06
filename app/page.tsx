// app/page.tsx
"use client";

import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TeamProof from "@/components/landing/TeamProof";
import FoundersStory from "@/components/landing/FounderStory";
import Benefits from "@/components/landing/Benefits";
import Athletes from "@/components/landing/Athletes";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-red-700 selection:text-white">
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