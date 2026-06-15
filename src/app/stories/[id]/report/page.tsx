"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

const REASONS = [
  "사연 내용이 사실과 다른 것 같습니다",
  "다른 곳에서 본 사연과 동일합니다 (도용 의심)",
  "후원금이 목적과 다르게 쓰이는 것 같습니다",
  "기타",
];

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: id, reason: reason || REASONS[0], detail }),
    });
    setDone(true);
  }

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md max-w-[600px]">
        <h1 className="font-headline-xl mb-2 flex items-center gap-2">
          <Icon name="report" className="text-secondary" /> 이상 사항 제보
        </h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          제보가 접수되면 해당 사연의 지급이 일시 정지되고 재심사가 시작됩니다. 집단의 눈이 가장 강력한 사기
          방지책입니다.
        </p>

        {done ? (
          <div className="bg-primary-container/10 border border-primary rounded-xl p-6 text-center">
            <Icon name="check_circle" fill className="text-primary" size={40} />
            <p className="font-body-lg font-bold text-primary mt-2">제보가 접수되었습니다</p>
            <p className="font-body-md text-on-surface-variant mt-1">검토 후 필요한 조치를 취하겠습니다. 감사합니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-stack-md">
            <fieldset>
              <legend className="font-label-sm text-on-surface mb-3">제보 사유</legend>
              <div className="flex flex-col gap-2" role="radiogroup">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                      reason === r ? "border-primary bg-surface-container-low" : "border-outline-variant"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-body-md text-on-surface">{r}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="detail" className="font-label-sm text-on-surface block mb-2">
                자세한 내용 (선택)
              </label>
              <textarea
                id="detail"
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-outline-variant focus:border-primary focus:border-[3px] outline-none font-body-md bg-surface-container-lowest"
                placeholder="알고 계신 내용을 자유롭게 적어주세요."
              />
            </div>
            <Button variant="secondary" onClick={submit} disabled={submitting} icon="send">
              제보 보내기
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
