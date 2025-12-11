import CoachSidebar from '@/components/layout/CoachNavbar';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import { AuthProvider } from '@/context/AuthContext';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50"> {/* TRAVA TELA INTEIRA */}
      <AuthProvider>
        <SidebarWrapper>
          <CoachSidebar />
        </SidebarWrapper>
        
        {/* Container da Direita (Header + Conteúdo) */}
        <div className="flex flex-col flex-1 h-full overflow-hidden md:ml-64 relative">
          <HeaderBar />

          {/* Área de Conteúdo (SÓ AQUI PODE ROLAR) */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth">
             {children}
          </main>
        </div>
      </AuthProvider>
    </div>
  );
}
