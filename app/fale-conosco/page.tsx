import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowLeft, MessageCircle } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Fale Conosco | The Grinders",
  description: "Entre em contato com a equipe The Grinders Powerlifting.",
};

interface ContactCardProps {
  href: string;
  external?: boolean;
  iconSrc: string;
  iconAlt: string;
  iconBg: string;
  iconBorder: string;
  iconHoverBg: string;
  borderHover: string;
  shadowHover: string;
  title: string;
  description: string;
  label: string;
  labelColor: string;
}

function ContactCard({
  href, external, iconSrc, iconAlt, iconBg, iconBorder, iconHoverBg,
  borderHover, shadowHover, title, description, label, labelColor,
}: ContactCardProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group bg-neutral-900 border border-neutral-800 ${borderHover} rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 ${shadowHover}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${iconBg} border ${iconBorder} flex items-center justify-center mb-5 ${iconHoverBg} transition-colors`}>
        <Image src={iconSrc} alt={iconAlt} width={32} height={32} className="object-contain" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 mb-4 leading-relaxed flex-1">{description}</p>
      <span className={`text-sm font-bold ${labelColor} group-hover:underline break-all`}>{label}</span>
    </a>
  );
}

export default function FaleConoscoPage() {
  return (
    <div
      id="main-scroll"
      className="h-screen w-full overflow-y-auto overflow-x-hidden bg-neutral-950 text-white"
    >
      <Header />

      <main className="pt-28 pb-24 container mx-auto px-4 max-w-4xl">

        {/* Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Voltar para o início
        </Link>

        {/* Cabeçalho */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-900/40 text-red-500 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <MessageCircle size={12} />
            Suporte & Contato
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Fale <span className="text-red-700">Conosco</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
            Dúvidas sobre a plataforma, interesse em treinar com a equipe ou querer conhecer mais sobre o powerlifting? Escolha o canal que preferir.
          </p>
        </div>

        {/* Cards de contato — grid 2×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <ContactCard
            href="https://wa.me/554199592555"
            external
            iconSrc="/images/icons/icon_whatsapp.png"
            iconAlt="WhatsApp"
            iconBg="bg-green-900/20"
            iconBorder="border-green-800/40"
            iconHoverBg="group-hover:bg-green-700/20"
            borderHover="hover:border-green-600"
            shadowHover="hover:shadow-lg hover:shadow-green-900/20"
            title="WhatsApp"
            description="Resposta rápida para dúvidas urgentes ou interesse em se tornar um Grinder."
            label="(41) 9959-2555"
            labelColor="text-green-500"
          />

          <ContactCard
            href="mailto:thegrinderspowerlifting@gmail.com"
            iconSrc="/images/icons/icon_email.png"
            iconAlt="Email"
            iconBg="bg-blue-900/20"
            iconBorder="border-blue-800/40"
            iconHoverBg="group-hover:bg-blue-700/20"
            borderHover="hover:border-blue-600"
            shadowHover="hover:shadow-lg hover:shadow-blue-900/20"
            title="E-mail"
            description="Para sugestões, parcerias ou problemas técnicos com a plataforma."
            label="thegrinderspowerlifting@gmail.com"
            labelColor="text-blue-400"
          />

          <ContactCard
            href="https://www.instagram.com/thegrinders_powerlifting"
            external
            iconSrc="/images/icons/icon_instagram.png"
            iconAlt="Instagram"
            iconBg="bg-pink-900/20"
            iconBorder="border-pink-800/40"
            iconHoverBg="group-hover:bg-pink-700/20"
            borderHover="hover:border-pink-600"
            shadowHover="hover:shadow-lg hover:shadow-pink-900/20"
            title="Instagram"
            description="Siga para acompanhar resultados, novidades e a rotina da equipe."
            label="@thegrinders_powerlifting"
            labelColor="text-pink-400"
          />

          <ContactCard
            href="https://www.youtube.com/@thegrinders"
            external
            iconSrc="/images/icons/icon_youtube.png"
            iconAlt="YouTube"
            iconBg="bg-red-900/20"
            iconBorder="border-red-800/40"
            iconHoverBg="group-hover:bg-red-700/20"
            borderHover="hover:border-red-600"
            shadowHover="hover:shadow-lg hover:shadow-red-900/20"
            title="YouTube"
            description="Técnicas de treino, bastidores de competição e conteúdo educativo sobre powerlifting."
            label="@thegrinders"
            labelColor="text-red-500"
          />
        </div>

        {/* Localização */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-7 flex items-start gap-5 mb-12">
          <div className="w-12 h-12 rounded-xl bg-red-900/20 border border-red-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={22} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">Localização</h3>
            <p className="text-neutral-300 text-sm">Curitiba, PR — Brasil</p>
            <p className="text-neutral-500 text-sm mt-1.5">
              Atendimento presencial mediante agendamento via WhatsApp.
            </p>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>

          {[
            {
              q: "Como me torno um aluno da The Grinders?",
              a: "Entre em contato via WhatsApp ou Instagram. Nossa equipe irá apresentar os planos disponíveis e fazer uma avaliação inicial do seu perfil de treinamento.",
            },
            {
              q: "A plataforma funciona para qualquer nível?",
              a: "Sim. Atendemos desde iniciantes que querem aprender a base do powerlifting até atletas competitivos que buscam periodização avançada.",
            },
            {
              q: "Encontrei um bug na plataforma. O que faço?",
              a: "Envie um e-mail descrevendo o problema com print se possível. Nossa equipe técnica irá analisar e resolver o mais rápido possível.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="font-bold text-white text-sm mb-2">{item.q}</p>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
