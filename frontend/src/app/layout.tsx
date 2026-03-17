import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PPC Market Report — Analiza tu web y descubre tu oportunidad real en PPC",
  description:
    "Analiza tu web y descubre volumen de demanda, competidores activos, costes estimados por clic y oportunidades reales en PPC. Informe gratuito en menos de 1 minuto.",
  keywords: "PPC, Google Ads, market report, análisis PPC, competidores, CPC, keywords",
  openGraph: {
    title: "PPC Market Report",
    description: "Analiza tu web y descubre tu oportunidad real en PPC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
