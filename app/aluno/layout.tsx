import AlunoSidebar from '@/components/layout/AlunoNavbar';
import Footer from '@/components/layout/Footer';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarWrapper from '@/components/layout/SidebarWrapper';

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarWrapper>
        <AlunoSidebar />
      </SidebarWrapper>
      
      <div className="flex flex-col flex-1">
        <HeaderBar />

        {/* Container do conteúdo + footer */}
        <div className="flex flex-col flex-1 justify-between">
          <main className="flex-1 p-6 bg-gray-100">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}