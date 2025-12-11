"use client";
import Image from 'next/image';
import { motion } from "framer-motion"; // ADICIONE ESTA IMPORTAÇÃO

const FoundersStory = () => {
  return (
    <section className="py-24 bg-neutral-950">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Imagem (Reveal da Esquerda) */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative order-2 md:order-1 h-96 md:h-[500px]"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-neutral-800 w-full h-full relative">
              <Image
                src="/images/Cardoso_barra.jpg"
                alt="The Grinders Founders"
                fill={true}
                className="object-cover w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Conteúdo (Reveal da Direita) */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Nascido da Necessidade.
              <span className="block text-red-700 mt-2">Forjado no Ferro.</span>
            </h2>
            <div className="space-y-6 text-lg text-neutral-400 leading-relaxed">
              <p>
                Fundado por dois atletas de elite do powerlifting brasileiro, ambos com uma vasta
                experiência no esporte e múltiplos títulos nacionais, eles sabiam que o caos das planilhas 
                de Excel e apps genéricos estava limitando o potencial de seus atletas.
              </p>
              <p className="text-white font-bold border-l-4 border-red-700 pl-4">
                Eles precisavam de uma ferramenta tão séria quanto seus treinos.
              </p>
              <p>
                Assim nasceu o The Grinders App: um sistema direto, focado em performance, que permite 
                ao coach gerenciar cada detalhe e ao atleta focar apenas em uma coisa:{" "}
                <span className="text-red-700 font-bold">levantar mais peso.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FoundersStory;

