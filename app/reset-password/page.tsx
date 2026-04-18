"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "@/services/authService";

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

  return (
    <div className="flex min-h-screen bg-white">

      {/* Lado esquerdo — imagem */}
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

      {/* Lado direito — formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-neutral-100">

        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo_the_grinders_dark-removebg-preview.png"
            alt="The Grinders Logo"
            width={380}
            height={50}
            className="object-contain"
          />
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">

          {sucesso ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={48} className="text-green-600 mx-auto" />
              <h2 className="text-xl font-bold text-neutral-900">Senha redefinida!</h2>
              <p className="text-neutral-600 text-sm">
                Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
              </p>
            </div>
          ) : token === "" ? (
            <div className="text-center space-y-4">
              <AlertCircle size={48} className="text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-neutral-900">Link inválido</h2>
              <p className="text-neutral-600 text-sm">
                Este link é inválido ou já foi utilizado.
              </p>
              <Link href="/forgot-password" className="inline-block text-sm font-semibold text-red-700 hover:text-red-900 hover:underline">
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-neutral-900">Criar nova senha</h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Escolha uma senha segura para sua conta.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Nova senha */}
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
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 pr-12 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirmar senha */}
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
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 pr-12 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {erro && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors shadow-sm flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Salvar nova senha"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-sm font-semibold text-red-700 hover:text-red-900 hover:underline">
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
