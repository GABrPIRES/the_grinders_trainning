"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/services/authService";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Token inválido ou expirado.");
      });
  }, [token]);

  return (
    <div className="bg-surface-elevated p-8 rounded-xl shadow-lg border border-line max-w-md w-full text-center">
      {status === "loading" && (
        <div className="py-8">
          <Loader2 className="animate-spin w-12 h-12 text-brand mx-auto mb-4" />
          <h2 className="text-xl font-bold text-content-primary">Verificando...</h2>
          <p className="text-content-secondary mt-2">Estamos validando seu e-mail.</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-4">
          <CheckCircle className="w-16 h-16 text-semantic-success-text mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-content-primary mb-2">Sucesso!</h2>
          <p className="text-content-secondary mb-8">{message}</p>
          <Link
            href="/login"
            className="block w-full bg-brand text-content-on-brand font-bold py-3 rounded-lg hover:bg-brand-hover transition-colors"
          >
            Ir para Login
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="py-4">
          <XCircle className="w-16 h-16 text-semantic-error-text mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-content-primary mb-2">Ops!</h2>
          <p className="text-content-secondary mb-8">{message}</p>
          <Link href="/signup" className="text-brand font-semibold hover:underline">
            Voltar para o Cadastro
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-page p-4">
      <Suspense fallback={<div className="text-content-secondary">Carregando...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
