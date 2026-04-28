"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FoundersStory = () => {
  // ── Ref para detectar quando o blockquote entra no viewport (item 10) ───
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-15% 0px" });

  return (
    <section className="py-24 bg-neutral-950">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" as const }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative order-2 md:order-1 h-96 md:h-[500px]"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-neutral-800 w-full h-full relative">
              <Image
                src="/images/team/cardoso-barra.jpg"
                alt="The Grinders Founders"
                fill
                className="object-cover w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" as const, delay: 0.2 }}
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

              {/* ── Blockquote com borda que "acende" (item 10) ───────────── */}
              <div ref={quoteRef} className="relative pl-5 overflow-hidden">
                {/* Borda animada: vai de transparent a red-700 ao entrar no viewport */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-red-700 origin-top"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={quoteInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
                {/* Brilho que percorre a borda */}
                <motion.div
                  className="absolute left-0 top-0 w-1 h-8 rounded-full bg-white/60"
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={quoteInView ? { y: "400%", opacity: [0, 1, 0] } : {}}
                  transition={{ duration: 0.9, ease: "easeInOut", delay: 0.55 }}
                />
                <p className="text-white font-bold">
                  Eles precisavam de uma ferramenta tão séria quanto seus treinos.
                </p>
              </div>

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
