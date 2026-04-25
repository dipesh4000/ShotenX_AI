"use client";

import { Search, HelpCircle, Bell, Plus } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-5">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 h-8 w-64">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          placeholder="Search"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground sm:block">/</kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <HelpCircle className="h-3.5 w-3.5" /> Help
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
