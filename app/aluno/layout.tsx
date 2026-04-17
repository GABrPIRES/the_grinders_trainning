import AlunoSidebar from '@/components/layout/AlunoNavbar';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import FeedbackAlertBanner from '@/components/FeedbackAlertBanner';
import { AuthProvider } from '@/context/AuthContext';

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50"> {/* TRAVA TELA INTEIRA */}
      <AuthProvider>
        <SidebarWrapper>
          <AlunoSidebar />
        </SidebarWrapper>

        {/* Container da Direita (Header + Conteúdo) */}
        <div className="flex flex-col flex-1 h-full overflow-hidden md:ml-64 relative">
          <HeaderBar />
          <FeedbackAlertBanner />

          {/* Área de Conteúdo (SÓ AQUI PODE ROLAR) */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:pb-6 md:p-6 scroll-smooth">
              {children}
          </main>
        </div>
      </AuthProvider>
    </div>
  );
}