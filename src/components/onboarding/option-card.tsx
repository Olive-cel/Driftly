"use client";

import { cn } from "@/lib/utils";
import type { OnboardingOption } from "./steps";

interface OptionCardProps {
  option: OnboardingOption;
  selected: boolean;
  onSelect: (value: string) => void;
}

export function OptionCard({ option, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-2xl border-2 px-6 py-6 text-center transition-all duration-200",
        "hover:border-foreground/20 hover:shadow-md hover:shadow-black/[0.04]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-foreground bg-foreground/[0.03] shadow-md shadow-black/[0.04]"
          : "border-border/60 bg-card"
      )}
    >
      <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
        {option.emoji}
      </span>
      <span className={cn(
        "text-sm font-medium transition-colors",
        selected ? "text-foreground" : "text-muted-foreground"
      )}>
        {option.label}
      </span>
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
