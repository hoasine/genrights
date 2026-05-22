"use client";

import { Globe, Brain, Coins, Gavel } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Register + fingerprint",
    desc: "web.render reads the canonical URL; exec_prompt builds an on-chain content fingerprint.",
  },
  {
    icon: Coins,
    title: "Fund bounty",
    desc: "The rights holder locks GEN — rewards bounty hunters who find infringement.",
  },
  {
    icon: Gavel,
    title: "Report infringement",
    desc: "Hunters submit a suspect URL; the AI jury compares it to the original.",
  },
  {
    icon: Brain,
    title: "Automatic payout",
    desc: "~20% of the pool goes to the reporter when confidence meets the threshold.",
  },
];

export function HowItWorks() {
  return (
    <section className="glass-card p-6 md:p-8">
      <h2 className="text-2xl font-bold font-display mb-6">How it works</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-bold">
                {i + 1}
              </span>
              <s.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
