"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center max-w-md w-full"
      >
        <div className="relative h-20 w-40 mb-8">
          <Image
            src="/assets/logo/aeris-logo.png"
            alt="AERIS Logo"
            fill
            sizes="160px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-6xl font-black text-emerald-500 mb-4">404</h1>
        <h2 className="text-xl font-bold text-zinc-200 uppercase tracking-widest mb-4">
          Sector Not Found
        </h2>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          The environmental intelligence sector you are looking for is currently offline or does not exist.
        </p>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 font-bold hover:bg-emerald-500/20 transition-all text-sm w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Command Center
        </Link>
      </motion.div>
    </div>
  );
}
