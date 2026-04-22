"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "@/services/authService";
import DarkModeToggle from "@/components/layout/DarkModeToggle";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", passwordConfirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!token) setErro("Link inválido. Solicite um novo link de redefinição.");
  }, [token]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (form.password.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      setErro("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, form.password, form.passwordConfirmation);
      setSucesso(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setErro(err.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-surface-elevated border border-line-input text-content-primary placeholder:text-content-muted focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all pr-12";

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
          {sucesso ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={48} className="text-semantic-success-text mx-auto" />
              <h2 className="text-xl font-bold text-content-primary">Senha redefinida!</h2>
              <p className="text-content-secondary text-sm">
                Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
              </p>
            </div>
          ) : token === "" ? (
            <div className="text-center space-y-4">
              <AlertCircle size={48} className="text-semantic-error-text mx-auto" />
              <h2 className="text-xl font-bold text-content-primary">Link inválido</h2>
              <p className="text-content-secondary text-sm">
                Este link é inválido ou já foi utilizado.
              </p>
              <Link href="/forgot-password" className="inline-block text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-content-primary">Criar nova senha</h2>
                <p className="text-content-secondary text-sm mt-1">
                  Escolha uma senha segura para sua conta.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nova senha"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Confirmar nova senha"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content-secondary transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Salvar nova senha"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
