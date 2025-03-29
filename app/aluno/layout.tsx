import CoachSidebar from '@/components/layout/AlunoNavbar';
import Footer from '@/components/layout/Footer';

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <CoachSidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
        <Footer />
      </div>
    </div>
  );
}