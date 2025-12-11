"use client";
import { useRef, useState, useEffect } from "react";
import { Trophy, Award, Target, ChevronLeft, ChevronRight, BicepsFlexed } from "lucide-react";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";

const TeamProof = () => {
  const achievements = [
    { icon: BicepsFlexed, title: "Diversos Campeões Nacionais", description: "" },
    { icon: Award, title: "+50 Recordes Conquistados", description: "" },
    { icon: Target, title: "Medalhistas Internacionais", description: "" },
    { icon: Trophy, title: "Melhor Equipe do Brasil 2025", description: "" }
  ];

  // Adicione suas fotos aqui. Pode repetir a mesma para testar se tiver poucas.
  const teamImages = [
    "/images/carrossel_1.jpg",
    "/images/carrossel_2.jpg", // Exemplo: Adicione mais fotos na pasta public/images
    "/images/the_grinders_team.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Muda a cada 5 segundos (5000ms)
    const interval = setInterval(() => {
        nextSlide();
    }, 5000);

    // Limpa o timer se o componente desmontar ou se o usuário interagir
    return () => clearInterval(interval);
  }, [currentIndex]); // Dependência currentIndex garante que o timer reseta a cada troca

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === teamImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? teamImages.length - 1 : prev - 1));
  };

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

          {/* CARROSSEL DE FOTOS */}
          <div className="relative max-w-5xl mx-auto mb-16 h-96 md:h-[500px] group">
            
            {/* Container da Imagem com Animação */}
            <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-neutral-800 relative">
                {/* Usamos AnimatePresence ou Key para trocar a imagem suavemente */}
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
                        fill={true}
                        className="object-cover w-full h-full"
                        // Coloque um fallback se a imagem não existir para não quebrar o layout
                        onError={(e) => { e.currentTarget.src = "/images/the_grinders_team.jpg" }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
                </motion.div>
            </div>

            {/* Botões de Navegação (Aparecem no Hover ou sempre no mobile) */}
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-700 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-700 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicadores (Bolinhas) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {teamImages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === currentIndex ? "bg-red-600 w-6" : "bg-white/50 hover:bg-white"
                        }`}
                    />
                ))}
            </div>
          </div>
        </motion.div>

        {/* Conquistas (Grid) */}
        
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
                <h3 className="text-2xl font-bold mb-2 text-white">{achievement.title}</h3>
                <p className="text-neutral-400 text-lg">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamProof;