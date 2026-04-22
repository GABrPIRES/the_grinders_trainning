"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import DarkModeToggle from "@/components/layout/DarkModeToggle";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await login(form);
      const role = res.user?.role;
      if (role) Cookies.set("role", role, { expires: 7, path: "/" });
      router.refresh();
      if (role === "admin") router.push("/admin");
      else if (role === "personal") router.push("/coach");
      else router.push("/aluno");
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-app">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      {/* Imagem — desktop */}
      <div className="hidden md:block relative w-1/2 h-screen">
        <Image
          src="/images/davi-cardoso.png"
          alt="Atleta de powerlifting"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />
      </div>

      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-surface-page">

        <div className="flex justify-center mb-8">
          <Image
            src="/images/Gemini_Generated_Image_gvg24agvg24agvg2__3_-removebg-preview.png"
            alt="The Grinders Logo"
            width={280}
            height={50}
            className="object-contain hidden dark:block"
          />
          <Image
            src="/images/logo_the_grinders_dark-removebg-preview.png"
            alt="The Grinders Logo"
            width={280}
            height={50}
            className="object-contain block dark:hidden"
          />
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-content-primary">Bem-vindo de volta</h1>
            <p className="text-sm text-content-secondary mt-1">Entre na sua conta para continuar treinando.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
              className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-line-input text-content-primary placeholder:text-content-muted focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all"
            />

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Senha"
                className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-line-input text-content-primary placeholder:text-content-muted focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {erro && (
              <div className="text-sm text-semantic-error-text bg-semantic-error-bg px-3 py-2 rounded border border-semantic-error-border">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-content-on-brand font-bold py-3 rounded-lg hover:bg-brand-hover transition-colors shadow-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
            </button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="text-center">
              <span className="text-sm text-content-secondary">Não tem uma conta? </span>
              <Link href="/signup" className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
                Cadastre-se agora.
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
