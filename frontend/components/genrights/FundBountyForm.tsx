"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenRightsActions, useWorkIds } from "@/lib/hooks/useGenRights";
import { success, error as toastError } from "@/lib/utils/toast";

export function FundBountyForm({ defaultWorkId = "" }: { defaultWorkId?: string }) {
  const { fundBounty, pending, isConnected } = useGenRightsActions();
  const { data: workIds = [] } = useWorkIds();
  const [workId, setWorkId] = useState(defaultWorkId);
  const [amount, setAmount] = useState("1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workId) {
      toastError("Select a work_id");
      return;
    }
    try {
      await fundBounty(workId, parseFloat(amount) || 1);
      success("Bounty funded!");
    } catch (err) {
      toastError("fund_bounty failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display">Fund bounty pool</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Only the wallet that called register_work can fund. Send GEN with this transaction (payable).
        </p>
      </div>

      <div className="space-y-2">
        <Label>Work (work_id)</Label>
        {workIds.length > 0 ? (
          <select
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-input/30 px-3 text-sm font-mono"
            disabled={!isConnected || pending === "fund"}
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
            disabled={!isConnected || pending === "fund"}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Amount (GEN)</Label>
        <Input
          type="number"
          min="0.01"
          step="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isConnected || pending === "fund"}
        />
        <p className="text-xs text-muted-foreground">
          Confirmed reports pay ~20% of the pool to the reporter.
        </p>
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full h-11"
        disabled={!isConnected || pending === "fund"}
      >
        {pending === "fund" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4" />
            fund_bounty
          </>
        )}
      </Button>
    </form>
  );
}
