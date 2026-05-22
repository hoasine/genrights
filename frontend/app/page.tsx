"use client";

import { Navbar } from "@/components/Navbar";
import { AuthorLinks } from "@/components/AuthorLinks";
import { GenRightsApp } from "@/components/genrights/GenRightsApp";
import { AUTHOR } from "@/lib/site";
import { Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium mb-4">
              <Shield className="w-3.5 h-3.5" />
              Intelligent Contract · GenLayer Studionet
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">
              Gen<span className="text-gradient">Rights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              On-chain content licensing and infringement bounties — the contract reads the web
              and an AI jury decides, with no middleman.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>by {AUTHOR.name}</span>
              <AuthorLinks />
            </div>
          </header>

          <GenRightsApp />
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 px-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Built by {AUTHOR.name}</span>
          <AuthorLinks size="md" />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          GenRights · Powered by GenLayer · Private agreement + AI jury — not a court of law
        </p>
      </footer>
    </div>
  );
}
