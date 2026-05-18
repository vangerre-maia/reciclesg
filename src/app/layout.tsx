import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/ui/Providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReciclESG",
  description: "Plataforma para avaliação de impacto ESG da coleta seletiva",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geist.className} min-h-full bg-slate-50 text-slate-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
