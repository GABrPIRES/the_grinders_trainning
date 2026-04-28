import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Política de Privacidade | The Grinders",
  description: "Como a The Grinders coleta, usa e protege seus dados pessoais.",
};

const sections = [
  { id: "introducao",      title: "Introdução" },
  { id: "dados",           title: "Dados que Coletamos" },
  { id: "uso",             title: "Como Usamos Seus Dados" },
  { id: "compartilhamento","title": "Compartilhamento de Dados" },
  { id: "armazenamento",   title: "Armazenamento e Segurança" },
  { id: "retencao",        title: "Retenção de Dados" },
  { id: "direitos",        title: "Seus Direitos (LGPD)" },
  { id: "cookies",         title: "Cookies" },
  { id: "menores",         title: "Dados de Menores" },
  { id: "alteracoes",      title: "Alterações nesta Política" },
  { id: "dpo",             title: "Encarregado de Dados (DPO)" },
];

function Section({ id, num, title, children }: { id: string; num: number; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-10 scroll-mt-28">
      <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-neutral-800 flex items-baseline gap-3">
        <span className="text-red-700 font-black text-xl tabular-nums">{num}.</span>
        {title}
      </h2>
      <div className="text-neutral-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacidadePage() {
  return (
    <div
      id="main-scroll"
      className="h-screen w-full overflow-y-auto overflow-x-hidden bg-neutral-950 text-white"
    >
      <Header />

      <main className="pt-28 pb-24 container mx-auto px-4 max-w-3xl">

        {/* Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Voltar para o início
        </Link>

        {/* Cabeçalho */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-900/40 text-red-500 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <FileText size={12} />
            Documento Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Política de <span className="text-red-700">Privacidade</span>
          </h1>
          <p className="text-neutral-500 text-sm">Última atualização: abril de 2026</p>
        </div>

        {/* Índice de navegação */}
        <nav className="mb-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Índice</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
                >
                  <span className="text-red-700/50 group-hover:text-red-700 font-bold tabular-nums text-xs">{i + 1}.</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Seções */}
        <Section id="introducao" num={1} title="Introdução">
          <p>
            A The Grinders ("nós", "nosso") está comprometida com a proteção dos seus dados pessoais e com o cumprimento da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
          <p>
            Esta Política descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nossa plataforma.
          </p>
        </Section>

        <Section id="dados" num={2} title="Dados que Coletamos">
          <p>Coletamos os seguintes tipos de dados:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-neutral-300">Dados de identificação:</strong> nome, e-mail, telefone fornecidos no cadastro.
            </li>
            <li>
              <strong className="text-neutral-300">Dados de saúde e performance:</strong> peso, altura, cargas de treino, RPE, histórico de exercícios — inseridos voluntariamente por você.
            </li>
            <li>
              <strong className="text-neutral-300">Dados de uso:</strong> páginas acessadas, funcionalidades utilizadas, horários de acesso.
            </li>
            <li>
              <strong className="text-neutral-300">Dados financeiros:</strong> registros de pagamentos de planos (sem dados de cartão — não processamos pagamentos diretamente).
            </li>
          </ul>
        </Section>

        <Section id="uso" num={3} title="Como Usamos Seus Dados">
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Fornecer e melhorar os serviços da Plataforma</li>
            <li>Permitir que coaches acompanhem o progresso de seus atletas</li>
            <li>Enviar notificações relacionadas aos seus treinos e planos</li>
            <li>Suporte técnico e resolução de problemas</li>
            <li>Cumprir obrigações legais</li>
          </ul>
          <p>
            Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins comerciais.
          </p>
        </Section>

        <Section id="compartilhamento" num={4} title="Compartilhamento de Dados">
          <p>Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-neutral-300">Com seu coach:</strong> dados de treino e progresso são visíveis ao coach ao qual você está vinculado.
            </li>
            <li>
              <strong className="text-neutral-300">Prestadores de serviço:</strong> provedores de hospedagem e infraestrutura que nos ajudam a operar a Plataforma, sob contratos de confidencialidade.
            </li>
            <li>
              <strong className="text-neutral-300">Exigência legal:</strong> quando obrigados por lei ou ordem judicial.
            </li>
          </ul>
        </Section>

        <Section id="armazenamento" num={5} title="Armazenamento e Segurança">
          <p>
            Seus dados são armazenados em servidores seguros. Utilizamos criptografia (HTTPS/TLS), autenticação via JWT e boas práticas de segurança para proteger suas informações.
          </p>
          <p>
            Apesar de todos os esforços, nenhum sistema é 100% seguro. Em caso de incidente de segurança que afete seus dados, notificaremos você e a ANPD conforme exigido pela LGPD.
          </p>
        </Section>

        <Section id="retencao" num={6} title="Retenção de Dados">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são removidos em até 90 dias, salvo obrigação legal de retenção por prazo maior.
          </p>
        </Section>

        <Section id="direitos" num={7} title="Seus Direitos (LGPD)">
          <p>Como titular dos dados, você tem direito a:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação dos dados</li>
            <li>Solicitar a portabilidade dos dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
            <li>Opor-se ao tratamento em caso de descumprimento da LGPD</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail ou WhatsApp informados na página{" "}
            <Link href="/fale-conosco" className="text-red-500 hover:underline">Fale Conosco</Link>.
          </p>
        </Section>

        <Section id="cookies" num={8} title="Cookies">
          <p>
            Utilizamos cookies essenciais para manter sua sessão autenticada e preferências de tema. Não utilizamos cookies de rastreamento publicitário.
          </p>
        </Section>

        <Section id="menores" num={9} title="Dados de Menores">
          <p>
            A Plataforma não é destinada a menores de 18 anos sem supervisão de responsável. Não coletamos intencionalmente dados de crianças e adolescentes sem consentimento parental.
          </p>
        </Section>

        <Section id="alteracoes" num={10} title="Alterações nesta Política">
          <p>
            Podemos atualizar esta Política periodicamente. A data de última atualização será sempre informada no topo desta página. Alterações significativas serão notificadas via e-mail.
          </p>
        </Section>

        <Section id="dpo" num={11} title="Encarregado de Dados (DPO)">
          <p>
            Nosso encarregado de proteção de dados pode ser contactado pelo e-mail:{" "}
            <a href="mailto:thegrinderspowerlifting@gmail.com" className="text-red-500 hover:underline">
              thegrinderspowerlifting@gmail.com
            </a>
          </p>
        </Section>

        {/* CTA */}
        <div className="mt-12 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center">
          <p className="text-neutral-400 text-sm mb-3">Dúvidas sobre sua privacidade?</p>
          <Link
            href="/fale-conosco"
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            Fale Conosco
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
