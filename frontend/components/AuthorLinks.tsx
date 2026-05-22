"use client";

import { Github } from "lucide-react";
import { AUTHOR } from "@/lib/site";
import { cn } from "@/lib/utils";

type AuthorLinksProps = {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function AuthorLinks({
  className,
  showLabel = false,
  size = "sm",
}: AuthorLinksProps) {
  const iconClass = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const btnClass =
    size === "md"
      ? "p-2 rounded-lg"
      : "p-1.5 rounded-md";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{AUTHOR.name}</span>
      )}
      <a
        href={AUTHOR.x}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          btnClass,
          "text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        )}
        aria-label="X (Twitter) — Hoa Tran Rom"
        title="X @HoaTranRom"
      >
        <span className={cn("font-bold leading-none", size === "md" ? "text-sm" : "text-xs")}>
          X
        </span>
      </a>
      <a
        href={AUTHOR.github}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          btnClass,
          "text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        )}
        aria-label="GitHub — hoasine"
        title="GitHub @hoasine"
      >
        <Github className={iconClass} />
      </a>
    </div>
  );
}
