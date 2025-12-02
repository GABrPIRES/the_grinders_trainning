// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;