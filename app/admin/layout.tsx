import SidebarWrapper from '@/components/layout/SidebarWrapper';
import AdminSidebar from '@/components/layout/AdminNavbar';
import HeaderBar from '@/components/layout/HeaderBar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <SidebarWrapper>
          <AdminSidebar />
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
    </AuthProvider>
  );
}

