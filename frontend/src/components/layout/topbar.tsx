"use client";

import { ModeToggle } from "./mode-toggle";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold text-sm">
          T
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
