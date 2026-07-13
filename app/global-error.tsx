"use client";

import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

/**
 * Global Next.js Error boundary.
 * Catches errors that bubble up to the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}
      >
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-red-400">Critical Error</h1>
            <p className="mt-4 text-slate-400">
              A catastrophic error occurred. Please refresh or try again.
            </p>
            <p className="mt-2 text-xs text-slate-500">{error.message}</p>
            <button
              onClick={() => reset()}
              className="mt-6 rounded-lg bg-red-500/20 px-6 py-3 font-semibold text-red-300 transition-colors hover:bg-red-500/30"
            >
              Recover Application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
