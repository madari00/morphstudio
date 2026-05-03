"use client";

import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({ 
  message = "Génération en cours...", 
  subMessage = "L'IA travaille sur ta transformation" 
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/30 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-white mt-6">{message}</h3>
        <p className="text-gray-400 mt-2">{subMessage}</p>
        
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: -10 }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}