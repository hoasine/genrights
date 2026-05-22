"use client";

import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGenRightsActions } from "@/lib/hooks/useGenRights";
import { parseUrlsInput } from "@/lib/contracts/genrights-utils";
import { success, error as toastError } from "@/lib/utils/toast";

const WORK_TYPES = [
  { value: "article", label: "Article / Blog" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "music", label: "Music" },
  { value: "code", label: "Source code" },
  { value: "design", label: "Design" },
];

export function RegisterWorkForm({ onSuccess }: { onSuccess?: () => void }) {
  const { registerWork, pending, isConnected } = useGenRightsActions();
  const [title, setTitle] = useState("");
  const [workType, setWorkType] = useState("article");
  const [urlsText, setUrlsText] = useState("");
  const [licenseTerms, setLicenseTerms] = useState(
    "Allowed: attribution required. Forbidden: commercial reuse without a license."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = parseUrlsInput(urlsText);
    if (!title.trim() || urls.length === 0) {
      toastError("Enter a title and at least one canonical URL");
      return;
    }
    try {
      await registerWork({ title, workType, urls, licenseTerms });
      success("Work registered!", {
        description:
          "Transaction accepted on-chain. Check the Registry tab (AI may take a few minutes).",
      });
      setTitle("");
      setUrlsText("");
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toastError("Registration failed", {
        description:
          msg.includes("FINALIZED") || msg.includes("ACCEPTED")
            ? "Still processing? Check Studio → Transactions. If status is ACCEPTED, refresh Registry."
            : msg,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display">Register work</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The contract reads your URL (web.render) and the AI builds an on-chain fingerprint.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My blog post"
          disabled={!isConnected || pending === "register"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workType">Content type</Label>
        <select
          id="workType"
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-input/30 px-3 text-sm"
          disabled={!isConnected || pending === "register"}
        >
          {WORK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urls">Canonical URL(s) — one per line, must be public</Label>
        <Textarea
          id="urls"
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder={"https://example.com/my-post\nhttps://raw.githubusercontent.com/..."}
          rows={4}
          disabled={!isConnected || pending === "register"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="license">License terms</Label>
        <Textarea
          id="license"
          value={licenseTerms}
          onChange={(e) => setLicenseTerms(e.target.value)}
          rows={4}
          disabled={!isConnected || pending === "register"}
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full h-11"
        disabled={!isConnected || pending === "register"}
      >
        {pending === "register" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing (AI may take 5–12 min)...
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            register_work
          </>
        )}
      </Button>

      {!isConnected && (
        <p className="text-xs text-amber-400 text-center">
          Connect your wallet (top right) to submit
        </p>
      )}
    </form>
  );
}
