"use client";

import Link from "next/link";
import { 
  Instagram, Twitter, Facebook, Mail, 
  MapPin, Phone, ArrowRight, Dumbbell 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-900 font-sans">
      
      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* COLUNA 1: MARCA & SOBRE */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
               <div className="bg-red-700 p-1.5 rounded-lg">
                  <Dumbbell size={20} className="text-white" />
               </div>
               <span className="text-xl font-extrabold tracking-tighter">THE GRINDERS</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-500">
              A plataforma definitiva para coaches e atletas que buscam alta performance. 
              Gestão de treinos, pagamentos e evolução em um só lugar.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Instagram size={18} />} />
              <SocialLink href="#" icon={<Twitter size={18} />} />
              <SocialLink href="#" icon={<Facebook size={18} />} />
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/login" text="Login" />
              <FooterLink href="/#" text="Criar Conta" />
              <FooterLink href="/#" text="Planos & Preços" />
              <FooterLink href="/#" text="Encontrar Coach" />
            </ul>
          </div>

          {/* COLUNA 3: SUPORTE & LEGAL */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Suporte</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/#" text="Central de Ajuda" />
              <FooterLink href="/#" text="Termos de Uso" />
              <FooterLink href="/#" text="Política de Privacidade" />
              <FooterLink href="/#" text="Fale Conosco" />
            </ul>
          </div>

          {/* COLUNA 4: CONTATO / NEWSLETTER */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contato</h3>
            <div className="space-y-4 text-sm">
               <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-700 shrink-0 mt-0.5" />
                  <span>Rua Jacaré Copaíba, 171 - São Paulo, SP<br/>Brasil</span>
               </div>
               <div className="flex items-center gap-3">
                  <Mail size={18} className="text-red-700 shrink-0" />
                  <a href="mailto:contato@thegrinders.com" className="hover:text-white transition-colors">gabrielribeiropires@outlook.com</a>
               </div>
               
               {/* Newsletter Input (Decorativo) */}
               <div className="pt-4">
                  <p className="text-xs font-bold text-neutral-500 mb-2 uppercase">Receba novidades (Em breve)</p>
                  <div className="flex">
                     <input 
                       type="email" 
                       placeholder="Seu email" 
                       className="bg-neutral-900 border border-neutral-800 text-white px-3 py-2 rounded-l-lg text-sm w-full focus:outline-none focus:border-red-700 transition-colors"
                     />
                     <button className="bg-red-700 hover:bg-red-800 text-white px-3 rounded-r-lg transition-colors">
                        <ArrowRight size={16} />
                     </button>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* BARRA INFERIOR (COPYRIGHT) */}
      <div className="border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
          <p>&copy; {currentYear} The Grinders Inc. Todos os direitos reservados.</p>
          <div className="flex gap-6">
             <span className="hover:text-neutral-400 cursor-pointer transition-colors">Brasil (PT-BR)</span>
             <span className="hover:text-neutral-400 cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Pequenos componentes auxiliares para manter o código limpo
function FooterLink({ href, text }: { href: string, text: string }) {
  return (
    <li>
      <Link href={href} className="hover:text-red-500 hover:pl-1 transition-all duration-300 block">
        {text}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-red-700 hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}