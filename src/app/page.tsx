"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/components/providers/auth-provider";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  React.useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="space-y-4 text-center max-w-sm w-full px-6">
        <div className="inline-flex w-12 h-12 rounded bg-gradient-to-tr from-accent-primary to-[#008ebb] items-center justify-center font-bold font-mono text-bg-primary text-xl shadow-glow animate-pulse">
          BF
        </div>
        <h2 className="text-sm font-semibold tracking-wider font-mono uppercase text-white">
          Initializing Portal
        </h2>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}
