"use client";

import { useState } from "react";
import { Gavel, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenRightsActions, useWorkIds } from "@/lib/hooks/useGenRights";
import { success, error as toastError } from "@/lib/utils/toast";

export function ReportForm({
  defaultWorkId = "",
  onReported,
}: {
  defaultWorkId?: string;
  onReported?: () => void;
}) {
  const { reportInfringement, pending, isConnected } = useGenRightsActions();
  const { data: workIds = [] } = useWorkIds();
  const [workId, setWorkId] = useState(defaultWorkId);
  const [suspectUrl, setSuspectUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workId || !suspectUrl.trim()) {
      toastError("Enter work_id and suspect URL");
      return;
    }
    try {
      await reportInfringement(workId, suspectUrl.trim());
      success("Report submitted!", {
        description: "See results under Registry → work details.",
      });
      setSuspectUrl("");
      onReported?.();
    } catch (err) {
      toastError("report_infringement failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display">Report infringement (bounty hunter)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI compares the suspect URL to the on-chain fingerprint. The bounty pool must be funded first.
        </p>
      </div>

      <div className="space-y-2">
        <Label>work_id</Label>
        {workIds.length > 0 ? (
          <select
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-input/30 px-3 text-sm font-mono"
            disabled={!isConnected || pending === "report"}
          >
            <option value="">— Select —</option>
            {workIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        ) : (
          <Input
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            placeholder="work_1_0x..."
            className="font-mono text-sm"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Suspect URL</Label>
        <Input
          value={suspectUrl}
          onChange={(e) => setSuspectUrl(e.target.value)}
          placeholder="https://copy-site.com/page"
          disabled={!isConnected || pending === "report"}
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full h-11"
        disabled={!isConnected || pending === "report"}
      >
        {pending === "report" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI jury (may take 5–12 min)...
          </>
        ) : (
          <>
            <Gavel className="w-4 h-4" />
            report_infringement
          </>
        )}
      </Button>
    </form>
  );
}
