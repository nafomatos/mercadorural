import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MercadoRural – Serviços e Produtos do Campo",
  description:
    "O marketplace rural do Brasil. Conectamos produtores, prestadores de serviços e compradores do campo em um só lugar.",
  keywords: ["agro", "rural", "fazenda", "serviços rurais", "marketplace", "brasil"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
