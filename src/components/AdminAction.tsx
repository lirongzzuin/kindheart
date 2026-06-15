"use client";
import { useState } from "react";
import { Icon } from "./Icon";

type Action = "approve" | "reject" | "suspend" | "release" | "hide" | "restore";

export function AdminAction({
  kind,
  id,
  actions,
}: {
  kind: "review" | "disbursement" | "content";
  id: string;
  actions: { action: Action; label: string; tone: "primary" | "danger" | "neutral" }[];
}) {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: Action) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "처리 실패");
      setDone(data.message ?? "처리되었습니다");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-1 text-primary font-label-sm">
        <Icon name="check_circle" fill size={20} /> {done}
      </p>
    );
  }

  const tone = {
    primary: "bg-primary text-on-primary",
    danger: "bg-error text-on-error",
    neutral: "bg-surface-container-high text-on-surface",
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2 flex-wrap justify-end">
        {actions.map((a) => (
          <button
            key={a.action}
            onClick={() => run(a.action)}
            disabled={busy}
            className={`min-h-touch-target-min px-4 rounded-lg font-label-sm active:scale-[0.98] transition-all disabled:opacity-50 ${tone[a.tone]}`}
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="text-error font-label-sm">{error}</p>}
    </div>
  );
}
