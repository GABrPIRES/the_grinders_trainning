"use client";
import Link from 'next/link';
import Image from 'next/image'; // Importe Image

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Agora usando a imagem completa */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-the-grinders-2-removebg-preview.png" // Caminho para a logo que você já adicionou
            alt="The Grinders Logo"
            width={140} // Tamanho ajustado para o cabeçalho
            height={30} 
            className="object-contain"
          />
        </Link>

        {/* Links de Navegação (usando <a> para âncoras na mesma página) */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#team" className="text-neutral-400 hover:text-white transition-colors font-medium">
            A Equipe
          </a>
          <a href="#benefits" className="text-neutral-400 hover:text-white transition-colors font-medium">
            Benefícios
          </a>
          <a href="#athletes" className="text-neutral-400 hover:text-white transition-colors font-medium">
            Atletas
          </a>
        </nav>

        {/* Botão CTA */}
        <Link 
          href="/login"
          className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-md font-bold transition-colors text-sm"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
};

export default Header;