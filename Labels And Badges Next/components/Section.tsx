"use client";

import { useState } from "react";

interface Props { title: string; defaultOpen?: boolean; children: React.ReactNode }

export default function Section({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-200">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        {title}
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </section>
  );
}
