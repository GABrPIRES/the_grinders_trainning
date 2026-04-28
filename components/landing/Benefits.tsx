"use client";
import { useState } from "react";
import {
  Calendar, FileSpreadsheet, BarChart3, MessageSquare,
  ListChecks, TrendingUp, Camera, Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Benefits() {
  const [activeTab, setActiveTab] = useState<"coach" | "athlete">("coach");

  const coachBenefits = [
    { icon: Calendar,        title: "Gestão de Blocos",   description: "Crie e edite blocos de treino complexos com semanas e datas definidas." },
    { icon: FileSpreadsheet, title: "Importação Rápida",  description: "Pare de digitar. Importe suas planilhas de Excel existentes diretamente para o app." },
    { icon: BarChart3,       title: "Visão Completa",     description: "Acompanhe o progresso de todos os seus alunos em um dashboard inteligente." },
    { icon: MessageSquare,   title: "Feedback Rápido",    description: "Receba dados de RPE e evolução dos treinos." },
  ];

  const athleteBenefits = [
    { icon: ListChecks, title: "Clareza Total",          description: "Receba seu treino do dia de forma clara e objetiva. Sem confusão." },
    { icon: Dumbbell,   title: "Registro Flexível",      description: "Registre suas cargas em KG ou LB. O app cuida do resto." },
    { icon: TrendingUp, title: "Histórico de Progresso", description: "Veja seus recordes pessoais (PRs) subindo e acompanhe sua evolução em gráficos." },
    { icon: Camera,     title: "Comunicação Direta",     description: "Envie seus vídeos e RPEs diretamente para seu coach." },
  ];

  const contentVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
    exit:    { opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
  };

  const gridContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const gridItem = {
    hidden: { opacity: 0, y: 24 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const currentBenefits = activeTab === "coach" ? coachBenefits : athleteBenefits;

  return (
    <section id="benefits" className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="p-1.5 bg-neutral-950 rounded-xl flex gap-2 border border-neutral-800">
            {(["coach", "athlete"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-lg font-bold text-lg transition-colors ${
                  activeTab === tab
                    ? "text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-red-700 rounded-lg shadow-lg"
                    transition={{ type: "spring" as const, stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "coach" ? "Para Coaches" : "Para Atletas"}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Conteúdo com AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Título */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                {activeTab === "coach" ? "Gestão Total." : "Menos Distração."}
                <span className="block text-red-700 mt-2">
                  {activeTab === "coach" ? "Performance Máxima." : "Mais PRs."}
                </span>
              </h2>
            </div>

            {/* Cards 2×2 */}
            <motion.div
              variants={gridContainer}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 gap-6"
            >
              {currentBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={gridItem}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                  className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-red-900 transition-colors duration-300 hover:shadow-lg hover:shadow-red-900/10 group cursor-default"
                >
                  <div className="w-14 h-14 rounded-xl bg-red-900/20 group-hover:bg-red-700/25 transition-colors duration-300 flex items-center justify-center mb-5">
                    <benefit.icon className="w-7 h-7 text-red-600 group-hover:text-red-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{benefit.title}</h3>
                  <p className="text-neutral-400 text-lg leading-relaxed">{benefit.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-red-700/0 group-hover:text-red-600 transition-colors duration-300">
                    Saiba mais →
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
