"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const role = Cookies.get("role");
    if (role === "personal") router.replace("/coach");
    else if (role === "aluno")    router.replace("/aluno");
    else if (role === "admin")    router.replace("/admin");
    else                          router.replace("/login");
  }, [router]);

  return (
    <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center gap-8">
      {/* Ícone com pulso suave */}
      <div className="animate-pulse">
        <Image
          src="/icons/icon-192x192.png"
          alt="The Grinders"
          width={96}
          height={96}
          className="rounded-2xl shadow-2xl shadow-red-950/60"
          priority
        />
      </div>

      {/* Nome + dots */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-2xl font-black tracking-widest text-white">
          THE GRINDERS
        </span>
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-red-700 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
