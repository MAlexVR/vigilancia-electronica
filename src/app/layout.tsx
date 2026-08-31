import type { Metadata, Viewport } from "next";
import { Work_Sans, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radar Tecnológico — Electrónica CEET | SENA",
  description:
    "Radar interactivo de vigilancia científico-tecnológica del área de electrónica del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA 2026-2036.",
  keywords: [
    "radar tecnológico",
    "electrónica",
    "vigilancia tecnológica",
    "IIoT",
    "microelectrónica",
    "IA",
    "SENA",
    "CEET",
    "GICS",
  ],
  authors: [{ name: "Mauricio Alexander Vargas Rodríguez" }],
  icons: {
    icon: "/favicon/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Radar Tech",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#39a900",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${jetbrainsMono.variable} font-work-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale="es">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
