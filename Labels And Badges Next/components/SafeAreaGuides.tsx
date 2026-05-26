"use client";

import type { SafePadding } from "@/lib/builder/types";

interface Props { safePadding: SafePadding; active: boolean }

const R1 = "33.3333%";
const R2 = "66.6667%";

export default function SafeAreaGuides({ safePadding: s, active }: Props) {
  const line = active ? "border-indigo-400/80" : "border-slate-400/50";
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className={`absolute rounded-sm border border-dashed ${line}`} style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom }}>
        <div className={`absolute left-0 right-0 border-t border-dashed ${line}`} style={{ top: R1 }} />
        <div className={`absolute left-0 right-0 border-t border-dashed ${line}`} style={{ top: R2 }} />
        <div className="absolute left-0 right-0" style={{ top: 0, height: R1 }}>
          <div className={`absolute top-0 bottom-0 left-1/2 border-l border-dashed ${line}`} />
        </div>
        <div className="absolute left-0 right-0" style={{ bottom: 0, height: R1 }}>
          <div className={`absolute top-0 bottom-0 left-1/2 border-l border-dashed ${line}`} />
        </div>
      </div>
    </div>
  );
}
