"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("AERIS Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-zinc-950 p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8 shadow-2xl"
      >
        <div className="relative h-16 w-32 mb-6">
          <Image
            src="/assets/logo/aeris-logo.png"
            alt="AERIS Logo"
            fill
            sizes="128px"
            className="object-contain opacity-50 grayscale"
            priority
          />
        </div>

        <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest mb-3">
          System Malfunction
        </h2>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          The intelligence platform encountered an unexpected error while processing environmental data.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-3 font-bold hover:bg-red-500/20 transition-all text-sm w-full"
        >
          <RefreshCw className="h-4 w-4" />
          Reboot Core Systems
        </button>
      </motion.div>
    </div>
  );
}
