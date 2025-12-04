"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react"; // Adicionei Eye e EyeOff
import Cookies from "js-cookie";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Novo estado para mostrar senha
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await login(form); // Se falhar, ele joga pro catch
      
      // Se chegou aqui, o login foi 200 OK.
      const role = res.user?.role;

      // NÃO precisamos mais salvar o token manualmente. O navegador já pegou o Cookie.
      // Apenas salvamos a Role para ajudar na UI (opcional, mas útil)
      if (role) {
          Cookies.set("role", role, { expires: 7, path: '/' });
      }

      // Redirecionamento baseado na role
      router.refresh(); // Atualiza para o middleware pegar o cookie novo
      
      if (role === "admin") router.push("/admin");
      else if (role === "personal") router.push("/coach");
      else if (role === "aluno") router.push("/aluno");
      else {
          // Fallback se não tiver role
          router.push("/aluno"); 
      }

    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* --- LADO ESQUERDO (IMAGEM) --- */}
      {/* No mobile ele some (hidden), no desktop ocupa metade (md:w-1/2) e tela toda (h-screen) */}
      <div className="hidden md:block relative w-1/2 h-screen">

        {/* Imagem limpa, sem blur, ocupando tudo */}
        <Image
          src="/images/davi-cardoso.png"
          alt="Atleta de powerlifting"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />
        
        {/* Um gradiente preto muito leve APENAS na base para dar peso, sem atrapalhar a nitidez */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none"></div>
      </div>

      {/* --- LADO DIREITO (FORMULÁRIO) --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-neutral-100">
        
        {/* Logo Visível APENAS no Mobile (centralizada no topo) */}
        <div className="flex justify-center">
            <Image
              src="/images/logo_the_grinders_dark-removebg-preview.png" // Use a versão escura aqui se o fundo for branco
              // Se sua logo for branca e não aparecer no fundo branco, avise que trocamos para /logo-dark.png
              alt="The Grinders Logo"
              width={380}
              height={50}
              className="object-contain"
            />
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div className="space-y-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 bg-white"
              />
            </div>

            {/* Input Senha com Botão de Mostrar/Ocultar */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Alterna o tipo
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 pr-12 bg-white"
                />
                
                {/* Botão do Olhinho */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100">
                {erro}
              </div>
            )}

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors shadow-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
            </button>

            {/* Link Esqueceu a Senha */}
            <div className="text-center">
              <a href="#" className="text-sm font-semibold text-red-700 hover:text-red-900 hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}