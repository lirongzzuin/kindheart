"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

const REASONS = ["사기·외부 송금 유도", "욕설·비방·혐오", "개인정보 노출", "도배·광고 스팸", "기타"];

export default function CommunityReportPage() {
  const { id } = useParams<{ id: string }>();
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    await fetch(`/api/community/posts/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || REASONS[0] }),
    });
    setDone(true);
  }

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md max-w-[600px]">
        <h1 className="font-headline-xl mb-2 flex items-center gap-2">
          <Icon name="flag" className="text-secondary" /> 게시글 신고
        </h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          신고가 누적되면 게시글이 자동으로 숨겨지고 운영자가 검토합니다.
        </p>
        {done ? (
          <div className="bg-primary-container/10 border border-primary rounded-xl p-6 text-center">
            <Icon name="check_circle" fill className="text-primary" size={40} />
            <p className="font-body-lg font-bold text-primary mt-2">신고가 접수되었습니다</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                  reason === r ? "border-primary bg-surface-container-low" : "border-outline-variant"
                }`}
              >
                <input type="radio" name="r" checked={reason === r} onChange={() => setReason(r)} className="w-5 h-5 text-primary" />
                <span className="font-body-md">{r}</span>
              </label>
            ))}
            <Button variant="secondary" onClick={submit} icon="send" className="mt-3">
              신고 보내기
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
