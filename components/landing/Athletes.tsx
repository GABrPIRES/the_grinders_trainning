"use client";
import { useRef, useState } from "react";
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

// --- SUB-COMPONENTE: CARTÃO 3D (TILT + FLIP ANINHADOS) ---
const AthleteCard = ({ athlete, isDragging }: { athlete: any, isDragging: boolean }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Variáveis para o efeito Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Se estiver arrastando o carrossel, não aplica tilt para economizar performance
    if (isDragging) return; 

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = (e.clientX - rect.left) / width - 0.5;
    const mouseYVal = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXVal);
    y.set(mouseYVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Se estiver arrastando (isDragging do pai), bloqueamos o clique de virar
  const handleClick = () => {
      if (!isDragging) {
          setIsFlipped(!isFlipped);
      }
  };

  return (
    <div 
        className="relative w-[300px] md:w-[350px] h-[450px] [perspective:1000px] shrink-0 cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
    >
      {/* CAMADA 1: TILT (Segue o Mouse) */}
      <motion.div
         className="w-full h-full relative [transform-style:preserve-3d]"
         style={{ rotateX, rotateY }} // Aplica apenas o tilt aqui
      >
          {/* CAMADA 2: FLIP (Gira 180 graus) */}
          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d] transition-all duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }} // O Flip acontece DENTRO do Tilt
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          >
                {/* --- FRENTE --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
                    <div className="relative w-full h-full">
                        <Image
                            src={athlete.image}
                            alt={athlete.name}
                            fill={true}
                            className="object-cover pointer-events-none" // Importante para não arrastar a imagem fantasma
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-90"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <h3 className="text-2xl font-bold text-white mb-1">{athlete.name}</h3>
                            <p className="text-red-600 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                Clique para ver detalhes <RotateCw size={14} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- VERSO --- */}
                <div 
                    className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl bg-neutral-900 border border-red-900/30 p-8 flex flex-col justify-center items-center text-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 pointer-events-none"></div>
                    <div className="w-16 h-1 bg-red-700 mb-6 rounded-full"></div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{athlete.name}</h3>
                    <div className="px-4 py-1 bg-red-900/20 border border-red-800/50 rounded-full text-red-500 text-xs font-bold uppercase tracking-wider mb-6">
                        {athlete.achievement}
                    </div>
                    
                    <p className="text-neutral-300 italic text-lg leading-relaxed relative">
                        <span className="text-4xl text-red-800 absolute -top-4 -left-2">"</span>
                        {athlete.quote}
                        <span className="text-4xl text-red-800 absolute -bottom-8 -right-2">"</span>
                    </p>

                    <button className="mt-8 text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                        <RotateCw size={14} /> Voltar para foto
                    </button>
                </div>
          </motion.div>
      </motion.div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Athletes = () => {
  const athletes = [
    { 
      image: "/images/IMG-20250829-WA0146 - Gustavo.jpg",
      name: "Gustavo Almeida Fialho", 
      achievement: "Campeão Paranaense e Brasileiro 2025 (-105kg), Recordista Brasileiro de Agachamento", 
      quote: "Comentário do time: Estou na equipe praticamente desde a fundação. Sempre foram muito companheiros, tanto nos treinos quanto no apoio logístico em campeonatos." 
    },
    { 
      image: "/images/IMG_2218 - Vinicius Oliveira.JPEG",
      name: "Vinícius de Oliveira", 
      achievement: "Campeão Brasileiro e Paranaense 2025, Recordista Brasileiro de Agachamento e Total", 
      quote: "Comentário do App: Aguardando ansiosamente o lançamento completo! O sistema promete muito." 
    },
    { 
      image: "/images/IMG_2178 - Guilherme Borges Basso.jpeg",
      name: "Guilherme Borges Basso", 
      achievement: "Vice-campeão Catarinense Sub-Júnior 2025 (-74kg)", 
      quote: "Comentário do time: O time é extremamente único e unido. Todos em SC se ajudam de uma maneira surpreendente." 
    },
    { 
      image: "/images/Sup. e Terra 2022 68 - João Vitor.jpg",
      name: "João Vitor de Oliveira Camargo", 
      achievement: "Top 3 Campeonato Brasileiro 2025", 
      quote: "Comentário do time: A The Grinders não é só uma equipe, é também uma família." 
    },
    { 
      image: "/images/IMG_7448 - BRENO MARCONDES.jpeg",
      name: "Breno Marcondes", 
      achievement: "Atleta The Grinders", 
      quote: "Comentário do App: Muito bem estruturado e fácil de entender." 
    },
    { 
      image: "/images/14147d77-588d-40ec-92ee-ccf4edb9931a - Thiago Paiva.jpeg",
      name: "Thiago Ramos de Paiva", 
      achievement: "Tricampeão Estadual, Recordista de Supino (-66kg Jr/Open), 3º lugar Brasileiro 2025", 
      quote: "Comentário do time: O time está em outro nível! A estrutura e o apoio são incríveis." 
    },
    { 
      image: "/images/IMG_3457 - Rafaela Sunshine da silva.jpeg",
      name: "Rafaela Sunshine da Silva", 
      achievement: "Campeã Brasileira e Estadual 2025, Melhor Atleta Jr Catarinense", 
      quote: "Comentário do time: Uma equipe muito unida e acolhedora." 
    },
    { 
      image: "/images/IMG_3527 - Jean Felipe Ferraz Gonçalves.jpeg",
      name: "Jean Felipe Ferraz Gonçalves", 
      achievement: "Atleta The Grinders", 
      quote: "Comentário do time: Um time que nos abraça como familiares. Ninguém é melhor que ninguém, todos buscam evoluir e são tratados de maneira igual." 
    },
    { 
      image: "/images/PWR SUBJR-JR-UNIV-21 - Brloco2.jpg",
      name: "Angelo Henrique Ribeiro", 
      achievement: "Top 3 Paranaense Júnior", 
      quote: "Comentário do time: O apoio da equipe nos campeonatos é essencial. Ajudaram do início ao fim." 
    },
    { 
      image: "/images/ABAF7752-FB79-41F4-A2F9-6299F4AF3DFE - Leo Egas.jpeg",
      name: "Leo Namegas", 
      achievement: "Melhor Atleta Jr Paulista 2023, Recordista Estadual Agachamento/Terra/Total", 
      quote: "Comentário do time: A união da equipe é incrível, todos se ajudam e se gostam muito." 
    },
    { 
      image: "/images/WhatsApp Image 2026-01-09 at 11.25.46 - Laura Lima.jpeg",
      name: "André Luiz Cordeiro Júnior", 
      achievement: "Campeão Brasileiro e Sul-Americano de Supino Raw 2025", 
      quote: "Comentário do time: Equipe muito dedicada ao sucesso do próximo e com apoio incondicional aos atletas." 
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Estados para controlar o Drag vs Click
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // Flag real de movimento

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = 350;
        current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setIsDragging(false); // Reseta: ainda é um clique potencial
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    // Pequeno delay para garantir que o click do filho dispare antes de limpar o estado, se necessário
    setTimeout(() => setIsDragging(false), 50); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    
    // Só considera que está "arrastando" se moveu mais que 5 pixels
    // Isso permite diferenciar um "clique trêmulo" de um arrasto real
    if (Math.abs(walk) > 5) {
        setIsDragging(true);
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section id="athletes" className="py-24 bg-neutral-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
            Conheça Alguns dos Nossos
            <span className="block text-red-700 mt-2">"Grinders"</span>
          </h2>
          <div className="flex items-center justify-center gap-4 text-neutral-500 text-sm">
             <button onClick={() => scroll('left')} className="p-2 bg-neutral-900 border border-neutral-800 hover:bg-red-700 hover:text-white rounded-full transition-all shadow-lg active:scale-95"><ChevronLeft size={20}/></button>
             <p className="animate-pulse text-xs md:text-sm">Clique no card para virar</p>
             <button onClick={() => scroll('right')} className="p-2 bg-neutral-900 border border-neutral-800 hover:bg-red-700 hover:text-white rounded-full transition-all shadow-lg active:scale-95"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div 
            ref={scrollRef}
            className={`
                flex gap-6 md:gap-8 overflow-x-auto pb-12 pt-8 px-4 md:px-0 
                snap-x snap-mandatory scrollbar-hide
                ${isDown ? 'cursor-grabbing' : 'cursor-grab'} 
            `}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {athletes.map((athlete, index) => (
                <div key={index} className="snap-center pointer-events-auto"> 
                    {/* Passamos o isDragging para o card saber se deve ignorar o clique */}
                    <AthleteCard athlete={athlete} isDragging={isDragging} />
                </div>
            ))}
        </div>

      </div>
    </section>
  );
};

export default Athletes;