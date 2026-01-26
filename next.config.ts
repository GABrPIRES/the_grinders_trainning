// next.config.ts
import type { NextConfig } from "next";

// 1. Inicializa o plugin do PWA
// Usamos 'require' aqui porque alguns plugins do Next ainda não exportam tipos ES6 perfeitamente
const withPWA = require("next-pwa")({
  dest: "public",         // Onde os arquivos do service worker serão gerados
  register: true,         // Registra o SW automaticamente
  skipWaiting: true,      // Atualiza o cache assim que uma nova versão estiver disponível
  disable: process.env.NODE_ENV === "development", // Desativa em localhost para não atrapalhar o dev
});

// 2. Sua configuração original (Segurança + React Strict Mode)
const nextConfig: NextConfig = {
  reactStrictMode: true, // Recomendado manter true
  
  // [SEGURANÇA] Cabeçalhos HTTP para blindar o navegador
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Impede que seu site seja aberto em um iframe (Clickjacking)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Impede o navegador de "adivinhar" tipos de arquivo (MIME Sniffing)
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protege dados de origem
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=()", // Bloqueia acesso a hardware sensível por padrão
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Força HTTPS por 2 anos
          }
        ],
      },
    ];
  },
};

// 3. Exporta a configuração envolvida pelo PWA
export default withPWA(nextConfig);