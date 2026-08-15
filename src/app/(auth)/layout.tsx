import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary items-center justify-center relative overflow-hidden px-4 py-12 select-none">
      {/* Background cyber grid & glow decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      {/* Decorative Glow Nodes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#008ebb]/5 blur-[120px] pointer-events-none" />

      {/* Main card box */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
