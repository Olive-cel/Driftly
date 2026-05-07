"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i <= current ? "bg-foreground" : "bg-border"
            )}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {current + 1}/{total}
      </span>
    </div>
  );
}
