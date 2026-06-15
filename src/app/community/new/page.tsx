"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { scanContent } from "@/lib/pii";
import { CommunityCategory, COMMUNITY_CATEGORY_LABEL } from "@/lib/types";

const CATS: CommunityCategory[] = ["thanks", "story_share", "question", "free"];

export default function NewPostPage() {
  const router = useRouter();
  const [category, setCategory] = useState<CommunityCategory>("thanks");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 작성 중 실시간 위험요소 안내 (서버에서도 재검증 — 이중 방어)
  const warnings = useMemo(() => {
    const s = scanContent(`${title}\n${body}`, true);
    return s.findings;
  }, [title, body]);
  const hasBlock = warnings.some((w) => w.severity === "block");

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "등록에 실패했습니다.");
      router.push("/community");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <AppShell hideChrome>
      <div className="px-margin-mobile md:px-0 py-stack-md pb-40">
        <h1 className="font-headline-xl text-primary mb-stack-md">글쓰기</h1>

        <fieldset className="mb-stack-md">
          <legend className="font-label-sm text-on-surface mb-2">분류</legend>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`px-4 min-h-touch-target-min rounded-full font-label-sm border transition-colors ${
                  category === c ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface"
                }`}
              >
                {COMMUNITY_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 mb-stack-md">
          <label htmlFor="t" className="font-label-sm text-on-surface">
            제목
          </label>
          <input
            id="t"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full h-[56px] px-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="flex flex-col gap-2 mb-stack-md">
          <label htmlFor="b" className="font-label-sm text-on-surface">
            내용
          </label>
          <textarea
            id="b"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={8}
            className="w-full p-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
            placeholder="후원 경험이나 응원을 나눠주세요. 계좌·연락처·외부 링크는 안전을 위해 차단됩니다."
          />
        </div>

        {warnings.length > 0 && (
          <div
            role="alert"
            className={`mb-stack-md p-4 rounded-xl border ${
              hasBlock ? "bg-error-container border-error text-on-error-container" : "bg-surface-container-low border-outline-variant text-on-surface-variant"
            }`}
          >
            <p className="font-label-sm flex items-center gap-1 mb-1">
              <Icon name={hasBlock ? "block" : "warning"} size={20} />
              {hasBlock ? "다음 내용은 등록할 수 없습니다" : "주의"}
            </p>
            <ul className="list-disc pl-5 font-body-md">
              {warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p role="alert" className="mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm">
            {error}
          </p>
        )}

        <div className="fixed bottom-0 left-0 w-full bg-surface px-margin-mobile py-4 border-t border-outline-variant z-40">
          <div className="max-w-[800px] mx-auto flex gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button
              variant="secondary"
              onClick={submit}
              disabled={submitting || hasBlock || title.length < 2 || body.length < 2}
              className="flex-[2]"
            >
              {submitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
