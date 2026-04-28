import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Termos de Uso | The Grinders",
  description: "Termos e condições de uso da plataforma The Grinders.",
};

const sections = [
  { id: "aceitacao",       title: "Aceitação dos Termos" },
  { id: "descricao",       title: "Descrição do Serviço" },
  { id: "cadastro",        title: "Cadastro e Conta" },
  { id: "uso-permitido",   title: "Uso Permitido" },
  { id: "conteudo",        title: "Conteúdo do Usuário" },
  { id: "pagamentos",      title: "Pagamentos e Planos" },
  { id: "disponibilidade", title: "Disponibilidade e Suporte" },
  { id: "responsabilidade","title": "Limitação de Responsabilidade" },
  { id: "alteracoes",      title: "Alterações nos Termos" },
  { id: "encerramento",    title: "Encerramento de Conta" },
  { id: "lei",             title: "Lei Aplicável" },
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

export default function TermosDeUsoPage() {
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
            Termos de <span className="text-red-700">Uso</span>
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
        <Section id="aceitacao" num={1} title="Aceitação dos Termos">
          <p>
            Ao acessar ou utilizar a plataforma The Grinders ("Plataforma"), você concorda com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize a Plataforma.
          </p>
          <p>
            Estes termos constituem um acordo legal entre você ("Usuário") e The Grinders ("nós", "nosso").
          </p>
        </Section>

        <Section id="descricao" num={2} title="Descrição do Serviço">
          <p>
            A The Grinders é uma plataforma de gestão de treinos de powerlifting que conecta coaches e atletas, permitindo a criação, acompanhamento e análise de programas de treinamento.
          </p>
          <p>Os serviços incluem:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Criação e gestão de blocos de treino por coaches</li>
            <li>Registro de cargas e RPE por atletas</li>
            <li>Visualização de progresso e histórico</li>
            <li>Comunicação entre coach e atleta</li>
            <li>Gestão financeira de planos de treino</li>
          </ul>
        </Section>

        <Section id="cadastro" num={3} title="Cadastro e Conta">
          <p>
            Para utilizar a Plataforma, você deve criar uma conta com informações verdadeiras, precisas e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
          </p>
          <p>
            Não é permitido criar contas falsas, compartilhar credenciais com terceiros ou utilizar a conta de outro usuário sem autorização.
          </p>
        </Section>

        <Section id="uso-permitido" num={4} title="Uso Permitido">
          <p>Você concorda em utilizar a Plataforma exclusivamente para fins lícitos e de acordo com estes Termos. É proibido:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Usar a Plataforma para fins ilegais ou não autorizados</li>
            <li>Tentar acessar áreas restritas sem autorização</li>
            <li>Transmitir vírus, malware ou qualquer código prejudicial</li>
            <li>Coletar dados de outros usuários sem consentimento</li>
            <li>Reproduzir, duplicar ou copiar conteúdo da Plataforma sem permissão</li>
          </ul>
        </Section>

        <Section id="conteudo" num={5} title="Conteúdo do Usuário">
          <p>
            Ao inserir conteúdo na Plataforma (treinos, dados de performance, etc.), você mantém a propriedade sobre esse conteúdo, mas concede à The Grinders uma licença não exclusiva para armazená-lo e exibi-lo dentro da Plataforma.
          </p>
          <p>
            Você é o único responsável pela precisão e legalidade do conteúdo que inserir.
          </p>
        </Section>

        <Section id="pagamentos" num={6} title="Pagamentos e Planos">
          <p>
            Planos e valores são definidos pelos coaches e acordados diretamente com os atletas. A The Grinders facilita o registro e controle financeiro, mas não processa pagamentos diretamente.
          </p>
          <p>
            Não emitimos reembolsos por períodos não utilizados salvo acordo expresso entre coach e atleta.
          </p>
        </Section>

        <Section id="disponibilidade" num={7} title="Disponibilidade e Suporte">
          <p>
            Buscamos manter a Plataforma disponível 24 horas por dia, 7 dias por semana, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções programadas com ou sem aviso prévio.
          </p>
        </Section>

        <Section id="responsabilidade" num={8} title="Limitação de Responsabilidade">
          <p>
            A The Grinders não se responsabiliza por danos diretos, indiretos ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma, incluindo perdas de dados ou interrupções de serviço.
          </p>
          <p>
            Recomendações de treino são de responsabilidade exclusiva do coach. A The Grinders não é responsável por lesões ou problemas de saúde decorrentes do uso das informações contidas na Plataforma.
          </p>
        </Section>

        <Section id="alteracoes" num={9} title="Alterações nos Termos">
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas via e-mail ou notificação dentro da Plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section id="encerramento" num={10} title="Encerramento de Conta">
          <p>
            Você pode encerrar sua conta a qualquer momento entrando em contato pelo WhatsApp ou e-mail. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos.
          </p>
        </Section>

        <Section id="lei" num={11} title="Lei Aplicável">
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida ao foro da Comarca de Curitiba, PR.
          </p>
        </Section>

        {/* CTA */}
        <div className="mt-12 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center">
          <p className="text-neutral-400 text-sm mb-3">Dúvidas sobre estes termos?</p>
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
