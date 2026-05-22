"use client";

import { FileText, Scale, Shield, Coins } from "lucide-react";
import { useContractConfig } from "@/lib/hooks/useGenRights";

export function StatsCards() {
  const { data: config, isLoading } = useContractConfig();

  const items = [
    {
      label: "Registered works",
      value: isLoading ? "—" : String(config?.work_count ?? 0),
      icon: FileText,
    },
    {
      label: "Infringement reports",
      value: isLoading ? "—" : String(config?.report_count ?? 0),
      icon: Scale,
    },
    {
      label: "AI threshold",
      value: isLoading ? "—" : `${config?.default_min_confidence ?? 75}%`,
      icon: Shield,
    },
    {
      label: "Bounty payout",
      value: isLoading ? "—" : `${config?.bounty_reward_percent ?? 20}% of pool`,
      icon: Coins,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="glass-card p-5 flex flex-col gap-3">
          <item.icon className="w-5 h-5 text-accent" />
          <p className="text-2xl font-bold font-display">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
