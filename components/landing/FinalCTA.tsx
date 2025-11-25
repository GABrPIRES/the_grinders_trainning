"use client";
import Link from 'next/link';
import { motion } from "framer-motion"; // ADICIONE ESTA IMPORTAÇÃO

const FinalCTA = () => {
  return (
    <section className="py-32 bg-red-700 relative overflow-hidden">
      {/* Padrão de fundo sutil */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', 
        backgroundSize: '40px 40px' 
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.4 }}
        className="container mx-auto px-4 relative z-10 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter">
            Está Pronto para
            <span className="block mt-2 text-black/80">Mudar o Jogo?</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 font-medium">
            Pare de adivinhar. Comece a treinar com propósito.<br />
            Junte-se à revolução The Grinders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-white text-red-700 hover:bg-neutral-100 px-10 py-4 rounded-lg text-lg font-black transition-colors shadow-xl"
            >
              Sou Treinador
            </Link>
            <Link 
              href="/login" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-lg text-lg font-black transition-colors"
            >
              Sou Aluno
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCTA;