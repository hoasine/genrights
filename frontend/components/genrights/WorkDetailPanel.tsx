"use client";

import { Copy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressDisplay } from "@/components/AddressDisplay";
import {
  useWork,
  useWorkReports,
  type ReportView,
} from "@/lib/hooks/useGenRights";
import {
  formatSimilarity,
  isRightsHolder,
  statusVariant,
  weiToGen,
} from "@/lib/contracts/genrights-utils";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { success } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

function ReportCard({ report }: { report: ReportView }) {
  const variant = statusVariant(report.status);
  return (
    <div className="p-4 rounded-lg bg-black/30 border border-white/5 space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge
          className={cn(
            variant === "success" && "bg-green-500/20 text-green-300",
            variant === "warning" && "bg-amber-500/20 text-amber-300",
            variant === "secondary" && "bg-white/10 text-muted-foreground"
          )}
        >
          {report.status}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
      </div>
      <p className="text-sm break-all text-accent/90">{report.suspect_url}</p>
      <p className="text-xs text-muted-foreground">
        {report.decision} · confidence {report.confidence_percent}% · similarity{" "}
        {formatSimilarity(report.similarity_score)}
      </p>
      {report.evidence_summary && (
        <p className="text-sm leading-relaxed border-t border-white/5 pt-2 mt-2">
          {report.evidence_summary}
        </p>
      )}
    </div>
  );
}

export function WorkDetailPanel({
  workId,
  onFund,
  onReport,
}: {
  workId: string | null;
  onFund?: (id: string) => void;
  onReport?: (id: string) => void;
}) {
  const { address } = useWallet();
  const { data: work, isLoading, refetch } = useWork(workId);
  const { data: reports = [], isLoading: reportsLoading } = useWorkReports(workId);

  if (!workId) {
    return (
      <div className="glass-card p-8 text-center text-muted-foreground h-full min-h-[320px] flex items-center justify-center">
        Select a work from the list
      </div>
    );
  }

  if (isLoading || !work) {
    return (
      <div className="glass-card p-8 animate-pulse min-h-[320px]">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
        <div className="h-4 bg-white/5 rounded w-full mb-2" />
        <div className="h-4 bg-white/5 rounded w-3/4" />
      </div>
    );
  }

  const isOwner = isRightsHolder(work, address);
  let urls: string[] = [];
  try {
    urls = JSON.parse(work.canonical_urls_json);
  } catch {
    urls = [];
  }

  const copyId = () => {
    navigator.clipboard.writeText(work.id);
    success("work_id copied");
  };

  return (
    <div className="glass-card p-6 md:p-8 space-y-6 h-full overflow-y-auto max-h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold font-display">{work.title}</h2>
            <Badge>{work.status}</Badge>
            <Badge className="font-mono text-xs bg-white/10">{work.work_type}</Badge>
          </div>
          <button
            type="button"
            onClick={copyId}
            className="text-xs font-mono text-muted-foreground hover:text-accent flex items-center gap-1 mt-1"
          >
            {work.id} <Copy className="w-3 h-3" />
          </button>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg bg-black/25">
          <p className="text-muted-foreground text-xs">Bounty pool</p>
          <p className="text-lg font-bold text-accent">{weiToGen(work.bounty_pool)} GEN</p>
        </div>
        <div className="p-3 rounded-lg bg-black/25">
          <p className="text-muted-foreground text-xs">AI threshold</p>
          <p className="text-lg font-bold">{work.min_confidence_percent}%</p>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground text-xs">Rights holder</p>
        <AddressDisplay address={work.rights_holder} showCopy maxLength={16} />
        {isOwner && (
          <p className="text-xs text-green-400">✓ Your wallet — you can fund the bounty</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Canonical URLs</p>
        <ul className="space-y-1">
          {urls.map((u) => (
            <li key={u}>
              <a
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline break-all"
              >
                {u}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Fingerprint (AI)</p>
        <p className="text-sm leading-relaxed bg-black/25 p-3 rounded-lg max-h-32 overflow-y-auto">
          {work.fingerprint_summary || "—"}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">License</p>
        <p className="text-sm text-muted-foreground">{work.license_terms}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {isOwner && onFund && (
          <Button variant="outline" size="sm" onClick={() => onFund(work.id)}>
            Fund bounty
          </Button>
        )}
        {onReport && (
          <Button variant="gradient" size="sm" onClick={() => onReport(work.id)}>
            Report infringement
          </Button>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <h3 className="font-semibold">Reports ({reports.length})</h3>
        {reportsLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!reportsLoading && reports.length === 0 && (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        )}
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}
