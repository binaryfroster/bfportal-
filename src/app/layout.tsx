import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/components/providers/auth-provider";
import "@/src/app/globals.css";

export const viewport: Viewport = {
  themeColor: "#00F2FE",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Binary Froster | Client Portal & App",
  description:
    "Enterprise-grade delivery platform, AI systems command center, and native mobile/web app for Binary Froster software services.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BF Portal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#0A0D14] text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#0F172A",
                color: "#F8FAFC",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                fontSize: "13px",
                fontFamily: "monospace",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
