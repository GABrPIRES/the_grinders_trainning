"use client";
import { Trophy, Award, Target } from "lucide-react";
import Image from 'next/image';
import { motion } from "framer-motion";

const TeamProof = () => {
  const achievements = [
    { icon: Trophy, title: "Campeões Nacionais", description: "2024" },
    { icon: Award, title: "+10 Recordes", description: "Quebrados" },
    { icon: Target, title: "Atletas Internacionais", description: "De Elite" }
  ];

  return (
    <section id="team" className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4">
    <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }} // Inicia quando 20% do elemento está visível
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

          {/* Foto da Equipe */}
          <div className="relative max-w-5xl mx-auto mb-16 rounded-xl overflow-hidden shadow-2xl border border-neutral-800 h-96 md:h-[500px]">
            <Image
              src="/images/the_grinders_team.jpg"
              alt="The Grinders Team"
              fill={true}
              className="object-cover w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
          </div>
        </motion.div>

        {/* Conquistas (Com Animação em Sequência) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }} // Efeito sequencial
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
    </section>
  );
};

export default TeamProof;