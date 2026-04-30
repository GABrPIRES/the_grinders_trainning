"use client";
import { useRef, useState, useEffect } from "react";
import { Trophy, Award, Target, ChevronLeft, ChevronRight, BicepsFlexed } from "lucide-react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

// ── Counter animado (item 6) ─────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500; // ms
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

const TeamProof = () => {
  // Mapeamento: quais cards têm counter animado e quais valores
  const achievements = [
    { icon: BicepsFlexed, label: "Diversos Campeões Nacionais", counter: null },
    { icon: Award,        label: "+50 Recordes Conquistados",  counter: { target: 50, prefix: "+", suffix: " Recordes Conquistados" } },
    { icon: Target,       label: "Medalhistas Internacionais", counter: null },
    { icon: Trophy,       label: "Melhor Equipe do Brasil 2025", counter: null },
  ];

  const teamImages = [
    "/images/team/carrossel-10.jpg",
    "/images/team/carrossel-2.jpg",
    "/images/team/the-grinders-team.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === teamImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === teamImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? teamImages.length - 1 : prev - 1));

  return (
    <section id="team" className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
              A Ferramenta Oficial da Equipe
              <span className="block text-red-700 mt-2">The Grinders</span>
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Não é só um app. É o sistema que usamos para construir campeões.<br />
              Disciplina. O grind. A busca incessante por PRs.
            </p>
          </div>

          {/* Carrossel de fotos */}
          <div className="relative max-w-5xl mx-auto mb-16 h-96 md:h-[500px] group">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-neutral-800 relative">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full"
              >
                <Image
                  src={teamImages[currentIndex]}
                  alt={`Team photo ${currentIndex + 1}`}
                  fill
                  className="object-cover w-full h-full"
                  onError={(e) => { e.currentTarget.src = "/images/team/the-grinders-team.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60" />
              </motion.div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-700 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-700 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {teamImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? "bg-red-600 w-6" : "bg-white/50 hover:bg-white w-2.5"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Conquistas */}
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
                Títulos e Conquistas da Equipe
                <span className="block text-red-700 mt-2">The Grinders</span>
              </h2>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-red-700/50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <achievement.icon className="w-12 h-12 text-red-700 mx-auto mb-4" />

                {/* Card "+50 Recordes" usa counter animado; os outros mostram o label fixo */}
                {achievement.counter ? (
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {achievement.counter.prefix}
                    <AnimatedCounter
                      target={achievement.counter.target}
                    />
                    {" "}Recordes Conquistados
                  </h3>
                ) : (
                  <h3 className="text-2xl font-bold mb-2 text-white">{achievement.label}</h3>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamProof;
