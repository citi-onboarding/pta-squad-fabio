import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import { Toaster } from "react-hot-toast";

import "@/styles/globals.css";

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
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "8px",
              background: "#fff",
              color: "#0f172a",
              fontSize: "14px",
            },

            success: {
              style: {
                border: "1px solid #bbf7d0",
              },
            },

            error: {
              style: {
                border: "1px solid #fecaca",
              },
            },
          }}
        />

        <Header />

        {children}
      </body>
    </html>
  );
}