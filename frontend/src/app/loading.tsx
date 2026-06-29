"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative h-24 w-48 mb-6">
          <Image
            src="/assets/logo/aeris-logo.png"
            alt="AERIS - Air Environmental Response & Intelligence System"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-2">
          AERIS
        </h1>
        <p className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-8">
          Air Intelligence. Better Tomorrow.
        </p>

        {/* Subtle Pulse Loading Indicator */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-8 rounded-full bg-emerald-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
