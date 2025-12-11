"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Imagem de Fundo com Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/time_background_landing_page.jpg"
          alt="Powerlifter training"
          fill={true}
          className="object-cover w-full h-full opacity-60"
          priority
        />
        {/* Gradiente para escurecer a imagem */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/50 to-neutral-950" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        
        {/* TÍTULO - Sobe ao carregar */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-8xl font-black font-serif mb-6 tracking-tight text-white drop-shadow-2xl"
        >
          FORJE A SUA
          <span className="block text-red-700 mt-2">FORÇA.</span>
        </motion.h1>
        
        {/* SUBTÍTULO - Sobe com pequeno delay */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto mb-12 font-light"
        >
          O aplicativo de treino definitivo, criado pela equipe The Grinders.<br />
          Chega de planilhas. Apenas resultados.
        </motion.p>

        {/* BOTÕES - Aparecem em fade-in */}
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
    </section>
  );
};

export default Hero;