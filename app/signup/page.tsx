"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signup } from "@/services/authService";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, User, Mail, Lock, Phone, Key } from "lucide-react";

// Componente interno para usar useSearchParams com Suspense
function SignupFormContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('coachCode') || '';
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    coach_code: initialCode
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setForm(prev => ({ ...prev, coach_code: initialCode }));
    }
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

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
           <User size={32} />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Cadastro Realizado!</h2>
        <p className="text-neutral-600">
          Enviamos um link de confirmação para <strong>{form.email}</strong>.
        </p>
        <p className="text-sm text-neutral-500">
          Verifique sua caixa de entrada (e spam) para ativar sua conta.
        </p>
        <Link 
          href="/login"
          className="inline-block w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors"
        >
          Voltar para Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      <div className="text-center md:text-left">
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
        <p className="text-neutral-500">Preencha seus dados para começar.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nome */}
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-neutral-400" size={20} />
          <input
            name="name"
            required
            placeholder="Nome Completo"
            value={form.name}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-neutral-400" size={20} />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white"
          />
        </div>

        {/* Telefone e Código Coach */}
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-neutral-400" size={20} />
              <input
                name="phone_number"
                required
                placeholder="Celular"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white"
              />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 text-neutral-400" size={20} />
              <input
                name="coach_code"
                required
                placeholder="Cód. Coach"
                value={form.coach_code}
                onChange={(e) => setForm({...form, coach_code: e.target.value.toUpperCase()})}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white uppercase font-mono tracking-wider"
              />
            </div>
        </div>

        {/* Senha */}
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-neutral-400" size={20} />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirmar Senha */}
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-neutral-400" size={20} />
          <input
            name="password_confirmation"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Confirmar Senha"
            value={form.password_confirmation}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-neutral-900 placeholder:text-neutral-400 bg-white"
          />
        </div>

        {erro && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors shadow-sm flex justify-center items-center disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Criar Conta"}
        </button>

        <div className="text-center">
          <span className="text-neutral-500">Já tem uma conta? </span>
          <Link href="/login" className="font-semibold text-red-700 hover:text-red-900 hover:underline">
            Faça Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Lado Esquerdo - Imagem (Igual ao Login) */}
      <div className="hidden md:block relative w-1/2 h-screen">
        <Image
          src="/images/davi-cardoso.png" // Pode usar outra imagem aqui se quiser variar
          alt="Atleta de powerlifting"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10 pointer-events-none"></div>
      </div>

      {/* Lado Direito - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-neutral-100 overflow-y-auto">
        <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin mx-auto text-red-700"/></div>}>
          <SignupFormContent />
        </Suspense>
      </div>
    </div>
  );
}