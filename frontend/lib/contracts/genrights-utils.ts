import type { ReportView, WorkView } from "./GenRights";

export const GEN_DECIMALS = 18;

export function weiToGen(wei: number | bigint): string {
  const n = typeof wei === "bigint" ? Number(wei) : wei;
  if (!n || n === 0) return "0";
  const gen = n / 10 ** GEN_DECIMALS;
  return gen >= 1 ? gen.toFixed(4).replace(/\.?0+$/, "") : gen.toFixed(6);
}

export function genToWei(gen: number): bigint {
  return BigInt(Math.floor(gen * 10 ** GEN_DECIMALS));
}

export function parseUrlsInput(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter((u) => u.length > 0);
}

export function statusVariant(
  status: string
): "success" | "destructive" | "warning" | "secondary" {
  switch (status) {
    case "ACTIVE":
    case "CONFIRMED":
      return "success";
    case "REJECTED":
      return "secondary";
    case "INCONCLUSIVE":
      return "warning";
    default:
      return "secondary";
  }
}

export function isRightsHolder(work: WorkView, address: string | null): boolean {
  if (!address || !work.rights_holder) return false;
  return work.rights_holder.toLowerCase() === address.toLowerCase();
}

export function formatSimilarity(score: number): string {
  return `${(score / 100).toFixed(0)}%`;
}
