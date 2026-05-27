import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import "@/styles/globals.css";
import QueryProvider from "@/integration/queryProvider";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "A simple boilerplate for next.js",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <Header />
          {children}

          <Toaster
            position="top-right"
            reverseOrder={false}
          />
        </QueryProvider>
      </body>
    </html>
  );
}