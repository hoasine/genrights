"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GenRightsClient,
  type ReportView,
  type WorkView,
} from "@/lib/contracts/GenRights";
import { getContractAddress, getStudioUrl } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { genToWei } from "@/lib/contracts/genrights-utils";

export type ContractConfig = {
  default_min_confidence: number;
  bounty_reward_percent: number;
  work_count: number;
  report_count: number;
};

function useClient() {
  const { address } = useWallet();
  return useMemo(() => {
    const addr = getContractAddress();
    if (!addr) return null;
    return new GenRightsClient(addr, address ?? undefined, getStudioUrl());
  }, [address]);
}

export function useHasContract() {
  return Boolean(getContractAddress());
}

export function useContractConfig() {
  const client = useClient();
  return useQuery({
    queryKey: ["genrights", "config", getContractAddress()],
    queryFn: () => client!.getConfig() as Promise<ContractConfig>,
    enabled: !!client,
    refetchInterval: 15000,
  });
}

export function useWorkIds() {
  const client = useClient();
  return useQuery({
    queryKey: ["genrights", "workIds", getContractAddress()],
    queryFn: () => client!.listWorkIds(),
    enabled: !!client,
    refetchInterval: 10000,
  });
}

export function useWork(workId: string | null) {
  const client = useClient();
  return useQuery({
    queryKey: ["genrights", "work", workId],
    queryFn: () => client!.getWork(workId!),
    enabled: !!client && !!workId,
  });
}

export function useWorkReports(workId: string | null) {
  const client = useClient();
  return useQuery({
    queryKey: ["genrights", "reports", workId],
    queryFn: async () => {
      const ids = await client!.getWorkReportIds(workId!);
      const reports: ReportView[] = [];
      for (const id of ids) {
        reports.push(await client!.getReport(id));
      }
      return reports.reverse();
    },
    enabled: !!client && !!workId,
    refetchInterval: 10000,
  });
}

export function useGenRightsActions() {
  const { isConnected } = useWallet();
  const client = useClient();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["genrights"] });
  }, [queryClient]);

  const registerWork = useCallback(
    async (params: {
      title: string;
      workType: string;
      urls: string[];
      licenseTerms: string;
      minConfidence?: number;
    }) => {
      if (!client || !isConnected) throw new Error("Connect MetaMask first");
      setPending("register");
      try {
        await client.registerWork(
          params.title,
          params.workType,
          JSON.stringify(params.urls),
          params.licenseTerms,
          params.minConfidence ?? 75
        );
        await invalidate();
      } finally {
        setPending(null);
      }
    },
    [client, isConnected, invalidate]
  );

  const fundBounty = useCallback(
    async (workId: string, genAmount: number) => {
      if (!client || !isConnected) throw new Error("Connect MetaMask first");
      setPending("fund");
      try {
        await client.fundBounty(workId, genToWei(genAmount));
        await invalidate();
      } finally {
        setPending(null);
      }
    },
    [client, isConnected, invalidate]
  );

  const reportInfringement = useCallback(
    async (workId: string, suspectUrl: string) => {
      if (!client || !isConnected) throw new Error("Connect MetaMask first");
      setPending("report");
      try {
        await client.reportInfringement(workId, suspectUrl);
        await invalidate();
      } finally {
        setPending(null);
      }
    },
    [client, isConnected, invalidate]
  );

  return {
    registerWork,
    fundBounty,
    reportInfringement,
    pending,
    isConnected,
    invalidate,
  };
}

export type { WorkView, ReportView };
