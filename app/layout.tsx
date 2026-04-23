import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Configuração do Viewport
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. Metadados do PWA
export const metadata: Metadata = {
  title: "The Grinders Training",
  description: "Plataforma oficial de treino The Grinders Powerlifting.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Grinders",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

// Script inline que roda ANTES da hidratação para evitar flash de tema errado.
// Padrão: dark mode (app original era sempre escuro).
// Só aplica light se o usuário explicitamente escolheu light.
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('tg-theme');
    if (saved !== 'light') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png"  media="(device-width:320px) and (device-height:568px) and (-webkit-device-pixel-ratio:2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png"  media="(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png" media="(device-width:414px) and (device-height:736px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1125x2436.png" media="(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1242x2688.png" media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-828x1792.png"  media="(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1080x2340.png" media="(device-width:360px) and (device-height:780px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1170x2532.png" media="(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1284x2778.png" media="(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1179x2556.png" media="(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1290x2796.png" media="(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1488x2266.png" media="(device-width:744px) and (device-height:1133px) and (-webkit-device-pixel-ratio:2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1668x2388.png" media="(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-2048x2732.png" media="(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2)" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-app text-content-primary`}
      >
        {children}
      </body>
    </html>
  );
}