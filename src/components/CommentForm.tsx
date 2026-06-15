"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui";
import { scanContent } from "@/lib/pii";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = scanContent(body, true);
  const hasBlock = scan.findings.some((f) => f.severity === "block");

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "댓글 등록 실패");
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="cmt" className="sr-only">
        댓글 입력
      </label>
      <textarea
        id="cmt"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="따뜻한 댓글을 남겨주세요. (계좌·연락처·링크는 차단됩니다)"
        className="w-full p-4 rounded-xl border border-outline focus:border-[3px] focus:border-primary outline-none font-body-md bg-surface-container-lowest"
      />
      {hasBlock && (
        <p role="alert" className="font-label-sm text-error">
          {scan.findings.find((f) => f.severity === "block")?.message}
        </p>
      )}
      {error && <p role="alert" className="font-label-sm text-error">{error}</p>}
      <Button variant="primary" onClick={submit} disabled={submitting || hasBlock || body.trim().length < 1} className="self-end px-8">
        {submitting ? "등록 중..." : "댓글 등록"}
      </Button>
    </div>
  );
}
