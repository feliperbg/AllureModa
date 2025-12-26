import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Allure by Lu Mota | Moda Feminina",
  description: "Loja de moda feminina com as melhores tendências. Frete grátis em compras acima de R$299.",
  keywords: ["moda feminina", "roupas", "vestidos", "allure", "lu mota"],
};

import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'inherit',
            },
          }}
        />
      </body>
    </html>
  );
}
