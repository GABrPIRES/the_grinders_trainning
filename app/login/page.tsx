"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Image from "next/image"; // Precisamos do Image para o *fundo*
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [erro, setErro] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Suas funções de login originais
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await login(form);
      const role = res.user?.role;
      router.refresh();
      if (role === "admin") router.push("/admin");
      else if (role === "personal") router.push("/coach");
      else if (role === "aluno") router.push("/aluno");
      else setErro("Role inválida. Contate o suporte.");
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  // Componente de Logo em Texto (para ser reutilizado)
  const TextLogo = () => (
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-extrabold tracking-wider text-white uppercase">
        The Grinders
      </h1>
      <p className="text-sm font-light text-neutral-200" style={{ letterSpacing: '0.3em' }}>
        POWERLIFTING
      </p>
    </div>
  );

  return (
    // Layout de tela inteira: coluna no mobile, linha no desktop
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      
      {/* Lado Esquerdo (Branding/Imagem) */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-start 
                      bg-red-700 md:bg-transparent text-white 
                      h-48 md:h-screen overflow-hidden"> 
        
        {/* Imagem de Fundo (Aparece apenas no Desktop) */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/images/davi-cardoso.png" // <- Sua imagem do atleta
            alt="Atleta de powerlifting"
            layout="fill"
            objectFit="cover"
            quality={80}
            className="z-0"
          />
          {/* Overlay Vermelho com Blur (Desktop) */}
          <div className="absolute inset-0 bg-red-700 opacity-70 backdrop-blur-sm z-10"></div>
        </div>

        {/* Logo no Cabeçalho (Mobile) */}
        <div className="md:hidden relative z-20 flex items-center justify-center p-4 h-full">
          <TextLogo />
        </div>

        {/* Logo no Topo do Quadrante (Desktop) */}
        <div className="hidden md:flex relative z-20 p-8 pt-8 md:pt-12 items-start justify-start w-full">
          <TextLogo />
        </div>

      </div>

      {/* Lado Direito (Formulário de Login) */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-neutral-800">
        
        {/* Adiciona um logo "fantasma" no mobile para centralizar o form */}
        {/* Este é um truque para empurrar o formulário para baixo no mobile */}
        <div className="md:hidden h-48 -mt-48"></div> {/* Espaçador invisível */}

        <h2 className="text-3xl font-bold text-neutral-800 text-center mb-8">
          Bem-vindo(a) de volta!
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input de Email com Ícone */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-neutral-400" />
              </span>
              <input
                type="email" id="email" name="email"
                value={form.email} onChange={handleChange} required
                className="w-full p-3 pl-10 border border-neutral-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-neutral-800"
                disabled={loading} placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          {/* Input de Senha com Ícone */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-neutral-400" />
              </span>
              <input
                type="password" id="password" name="password"
                value={form.password} onChange={handleChange} required
                className="w-full p-3 pl-10 border border-neutral-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-neutral-800"
                disabled={loading} placeholder="••••••••"
              />
            </div>
          </div>

          {erro && (
            <div className="text-red-600 text-sm text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-700 text-white p-3 rounded-md font-semibold hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a href="#" className="text-red-600 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
}