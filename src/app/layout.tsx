import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/components/providers/auth-provider";
import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "Binary Froster | Client Portal",
  description:
    "Enterprise-grade delivery platform and customer command center for Binary Froster custom software services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#131313] text-white">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1f1f1f",
                color: "#fff",
                border: "1px solid #2a2a2a",
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
