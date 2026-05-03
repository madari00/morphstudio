/*import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}*/

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Camera, Wand2, Share2, ArrowRight, Play, X, Send, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoVideo, setDemoVideo] = useState<string | null>(null);

  const handleWatchDemo = () => {
    setDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">MorphStudio</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Transforme-toi en{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              anime
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Fais un geste magique devant ta caméra et deviens ton personnage
            anime préféré. Généré par IA en quelques secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white/10 text-lg px-8"
              onClick={handleWatchDemo}
            >
              <Play className="mr-2 w-5 h-5" />
              Voir la démo
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: <Camera className="w-12 h-12 text-purple-400" />,
              title: "Capture naturelle",
              description: "Active ta caméra, fais ton geste, et c'est parti",
            },
            {
              icon: <Wand2 className="w-12 h-12 text-purple-400" />,
              title: "IA puissante",
              description: "Génération rapide de ton personnage anime personnalisé",
            },
            {
              icon: <Share2 className="w-12 h-12 text-purple-400" />,
              title: "Partage instantané",
              description: "Exporte ta vidéo sur TikTok, Instagram et Reels",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * idx }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Section Comment ça marche */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Choisis ton personnage</h3>
              <p className="text-gray-400">Sélectionne ton anime préféré ou crée le tien</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fais le geste magique</h3>
              <p className="text-gray-400">Active ta caméra et imite le geste du personnage</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Devient ton anime</h3>
              <p className="text-gray-400">L'IA te transforme instantanément en personnage</p>
            </div>
          </div>
        </div>

        {/* Section Témoignages */}
        <div className="mt-32">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Ils ont testé
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white">👤</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Sophie</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                "Incroyable ! La transformation est bluffante, mes potes n'en reviennent pas !"
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white">👤</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Thomas</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                "Super simple d'utilisation, la détection des gestes est bluffante !"
              </p>
            </div>
          </div>
        </div>

        {/* Footer simplifié */}
        <footer className="mt-32 pt-8 border-t border-white/10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold text-white">MorphStudio</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforme-toi en anime par IA
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-purple-400">Fonctionnalités</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-purple-400">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-purple-400">CGU</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Mentions légales</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Suivez-nous</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-purple-400">
                  🐦 Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400">
                  📷 Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400">
                  🎥 YouTube
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8 pt-4">
            © 2026 MorphStudio - Tous droits réservés
          </div>
        </footer>
      </div>

      {/* Modal de démo */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl text-center">
              🎬 Démo - Transformation en anime
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Regarde comment ça fonctionne
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {demoVideo ? (
              <video
                src={demoVideo}
                controls
                autoPlay
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                <div className="relative w-48 h-48 mb-4">
                  <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-50" />
                  <div className="absolute inset-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>
                <p className="text-white text-center px-4">
                  🚀 Bientôt disponible !<br />
                  En attendant, va dans le dashboard et teste par toi-même !
                </p>
                <Link href="/register" className="mt-4">
                  <Button className="bg-purple-600">
                    Commencer gratuitement
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setDemoOpen(false)}
              className="text-white"
            >
              Fermer
            </Button>
            <Link href="/register">
              <Button className="bg-purple-600">
                Essayer maintenant
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}