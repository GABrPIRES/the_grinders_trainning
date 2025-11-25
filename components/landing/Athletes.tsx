"use client";
import Image from 'next/image';
import { motion } from "framer-motion"; // ADICIONE ESTA IMPORTAÇÃO

const Athletes = () => {
  const athletes = [
    { image: "/images/math_power.jpg", name: "Math do Santos", achievement: "Campeão Brasileiro", quote: "O app mudou completamente meu jogo. Foco 100% no treino." },
    { image: "/images/Vini_e_Cardoso.jpg", name: "Vinicius Oliveira", achievement: "Recordista Sul-Americana", quote: "A comunicação com meu coach ficou muito mais clara e eficiente." },
    { image: "/images/sunshine_alteta.jpg", name: "Rafaela Sunshine", achievement: "Atleta Internacional", quote: "Ver meus PRs subirem semana após semana é extremamente motivador." }
  ];
  
  // Variantes para o contêiner dos cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Atraso entre cada card
      }
    }
  };
  
  // Variantes para cada item (card)
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="athletes" className="py-24 bg-neutral-950">
      <div className="container mx-auto px-4">
        {/* Título */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
            Conheça Alguns dos Nossos
            <span className="block text-red-700 mt-2">"Grinders"</span>
          </h2>
        </motion.div>

        {/* Cards dos Atletas com Staggering */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {athletes.map((athlete, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-900 transition-all duration-300 group"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <Image
                  src={athlete.image}
                  alt={athlete.name}
                  fill={true}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80"></div>
              </div>
              <div className="p-8 relative -mt-12">
                <h3 className="text-2xl font-bold mb-1 text-white">{athlete.name}</h3>
                <p className="text-red-600 font-bold mb-4 text-sm uppercase tracking-wide">{athlete.achievement}</p>
                <p className="text-neutral-400 italic">"{athlete.quote}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Athletes;