"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setEnviado(true);
    } catch (err: any) {
      setErro(err.message || "Erro ao solicitar redefinição de senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-app">

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
            src="/images/logo-the-grinders-2-removebg-preview.png"
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
          {enviado ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={48} className="text-semantic-success-text mx-auto" />
              <h2 className="text-xl font-bold text-content-primary">Verifique seu e-mail</h2>
              <p className="text-content-secondary text-sm leading-relaxed">
                Se o e-mail <strong className="text-content-primary">{email}</strong> estiver cadastrado,
                você receberá um link para redefinir sua senha em breve.
              </p>
              <p className="text-content-tertiary text-xs">
                Não recebeu? Verifique a caixa de spam ou aguarde alguns minutos.
              </p>
              <Link href="/login" className="inline-block mt-2 text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-content-primary">Esqueceu sua senha?</h2>
                <p className="text-content-secondary text-sm mt-1">
                  Informe seu e-mail e enviaremos um link para criar uma nova senha.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full px-4 py-3 rounded-lg bg-surface-elevated border border-line-input text-content-primary placeholder:text-content-muted focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all"
                />

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
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar link de redefinição"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
                    Voltar ao login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
