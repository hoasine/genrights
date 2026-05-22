"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FilePlus,
  Coins,
  Gavel,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContractSetupBanner } from "@/components/ContractSetupBanner";
import { StatsCards } from "@/components/genrights/StatsCards";
import { HowItWorks } from "@/components/genrights/HowItWorks";
import { RegisterWorkForm } from "@/components/genrights/RegisterWorkForm";
import { FundBountyForm } from "@/components/genrights/FundBountyForm";
import { ReportForm } from "@/components/genrights/ReportForm";
import { WorksRegistry } from "@/components/genrights/WorksRegistry";
import { WorkDetailPanel } from "@/components/genrights/WorkDetailPanel";
import { getContractAddress } from "@/lib/genlayer/client";

type Tab = "overview" | "register" | "fund" | "report" | "registry";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "register", label: "Register", icon: FilePlus },
  { id: "fund", label: "Bounty", icon: Coins },
  { id: "report", label: "Report", icon: Gavel },
  { id: "registry", label: "Registry", icon: Library },
];

export function GenRightsApp() {
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [fundWorkId, setFundWorkId] = useState("");
  const [reportWorkId, setReportWorkId] = useState("");

  const contractAddr = getContractAddress();

  return (
    <div className="space-y-8">
      <ContractSetupBanner />

      {contractAddr && (
        <p className="text-xs font-mono text-muted-foreground text-center">
          Contract: {contractAddr.slice(0, 10)}...{contractAddr.slice(-8)}
        </p>
      )}

      <nav className="flex flex-wrap gap-2 justify-center p-1 rounded-xl bg-black/40 border border-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "gradient-purple-pink text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          <StatsCards />
          <HowItWorks />
        </div>
      )}

      {tab === "register" && (
        <div className="max-w-xl mx-auto animate-fade-in">
          <RegisterWorkForm onSuccess={() => setTab("registry")} />
        </div>
      )}

      {tab === "fund" && (
        <div className="max-w-xl mx-auto animate-fade-in">
          <FundBountyForm defaultWorkId={fundWorkId} />
        </div>
      )}

      {tab === "report" && (
        <div className="max-w-xl mx-auto animate-fade-in">
          <ReportForm
            defaultWorkId={reportWorkId}
            onReported={() => setTab("registry")}
          />
        </div>
      )}

      {tab === "registry" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          <div className="lg:col-span-4">
            <WorksRegistry
              selectedId={selectedWorkId}
              onSelect={setSelectedWorkId}
            />
          </div>
          <div className="lg:col-span-8">
            <WorkDetailPanel
              workId={selectedWorkId}
              onFund={(id) => {
                setFundWorkId(id);
                setTab("fund");
              }}
              onReport={(id) => {
                setReportWorkId(id);
                setTab("report");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
