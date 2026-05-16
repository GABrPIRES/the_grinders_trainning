"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signup } from "@/services/authService";
import Image from "next/image";
import Link from "next/link";

import { Loader2, User, Mail, Lock, Phone, Key, CheckCircle } from "lucide-react";
import PasswordField from "@/components/PasswordField";
import DarkModeToggle from "@/components/layout/DarkModeToggle";

function SignupFormContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("coachCode") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    coach_code: initialCode,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialCode) setForm((prev) => ({ ...prev, coach_code: initialCode }));
  }, [initialCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    if (form.password !== form.password_confirmation) {
      setErro("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      await signup(form);
      setSuccess(true);
    } catch (err: any) {
      setErro(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full py-3 rounded-lg bg-surface-elevated border border-line-input text-content-primary placeholder:text-content-muted focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all";

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-semantic-success-bg text-semantic-success-text rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-content-primary">Cadastro Realizado!</h2>
        <p className="text-content-secondary">
          Enviamos um link de confirmação para <strong className="text-content-primary">{form.email}</strong>.
        </p>
        <p className="text-sm text-content-tertiary">
          Verifique sua caixa de entrada (e spam) para ativar sua conta.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-brand text-content-on-brand font-bold py-3 rounded-lg hover:bg-brand-hover transition-colors"
        >
          Voltar para Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      <div className="flex justify-center">
        <Image
          src="/images/logos/logo_transparent.png"
          alt="The Grinders Logo"
          width={240}
          height={44}
          className="object-contain hidden dark:block"
        />
        <Image
          src="/images/logos/logo_dark_transparent.png"
          alt="The Grinders Logo"
          width={240}
          height={44}
          className="object-contain block dark:hidden"
        />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold text-content-primary">Criar conta</h1>
        <p className="text-sm text-content-secondary">Preencha seus dados para começar.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-content-muted" size={20} />
          <input
            name="name"
            required
            placeholder="Nome Completo"
            value={form.name}
            onChange={handleChange}
            className={`${inputClass} pl-10 pr-4`}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-content-muted" size={20} />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className={`${inputClass} pl-10 pr-4`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-content-muted" size={20} />
            <input
              name="phone_number"
              required
              placeholder="Celular"
              value={form.phone_number}
              onChange={handleChange}
              className={`${inputClass} pl-10 pr-4`}
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3.5 text-content-muted" size={20} />
            <input
              name="coach_code"
              required
              placeholder="Cód. Coach"
              value={form.coach_code}
              onChange={(e) => setForm({ ...form, coach_code: e.target.value.toUpperCase() })}
              className={`${inputClass} pl-10 pr-4 uppercase font-mono tracking-wider`}
            />
          </div>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-content-muted z-10" size={20} />
          <PasswordField
            name="password"
            required
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-content-muted z-10" size={20} />
          <PasswordField
            name="password_confirmation"
            required
            placeholder="Confirmar Senha"
            value={form.password_confirmation}
            onChange={handleChange}
            className={`${inputClass} pl-10`}
          />
        </div>

        {erro && (
          <div className="text-sm text-semantic-error-text bg-semantic-error-bg px-3 py-2 rounded border border-semantic-error-border">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-content-on-brand font-bold py-3 rounded-lg hover:bg-brand-hover transition-colors shadow-sm flex justify-center items-center disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Criar Conta"}
        </button>

        <div className="text-center">
          <span className="text-sm text-content-secondary">Já tem uma conta? </span>
          <Link href="/login" className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
            Faça Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-surface-app">
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <div className="hidden md:block relative w-1/2 h-screen">
        <Image
          src="/images/team/davi-cardoso.png"
          alt="Atleta de powerlifting"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none" />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-8 bg-surface-page overflow-y-auto">
        <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin mx-auto text-brand" /></div>}>
          <SignupFormContent />
        </Suspense>
      </div>
    </div>
  );
}
