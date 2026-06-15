import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CommentForm } from "@/components/CommentForm";
import { Badge } from "@/components/ui";
import { getComments, getPostById } from "@/lib/community-data";
import { COMMUNITY_CATEGORY_LABEL } from "@/lib/types";
import { sanitizeForDisplay } from "@/lib/pii";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post || post.status !== "visible") notFound();
  const comments = getComments(post.id).filter((c) => c.status === "visible");

  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <Link href="/community" className="flex items-center gap-2 mb-stack-md text-primary font-label-sm">
          <Icon name="arrow_back" /> 후원자 라운지
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Badge tone="neutral">{COMMUNITY_CATEGORY_LABEL[post.category]}</Badge>
          {post.verifiedDonor && (
            <Badge tone="verified" icon="verified">
              후원자
            </Badge>
          )}
        </div>

        <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">{post.title}</h1>
        <p className="font-label-sm text-on-surface-variant mb-stack-md">{post.authorNickname}</p>

        {/* 출력 시에도 한 번 더 PII 마스킹(이중 방어) */}
        <p className="font-body-lg text-on-surface whitespace-pre-line mb-stack-md">
          {sanitizeForDisplay(post.body)}
        </p>

        <div className="flex items-center gap-4 text-on-surface-variant font-label-sm border-y border-outline-variant py-3 mb-stack-md">
          <span className="flex items-center gap-1">
            <Icon name="favorite" size={20} /> {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="chat_bubble" size={20} /> {comments.length}
          </span>
          <Link href={`/community/${post.id}/report`} className="ml-auto flex items-center gap-1 underline">
            <Icon name="flag" size={18} /> 신고
          </Link>
        </div>

        {/* 댓글 */}
        <section className="mb-stack-md">
          <h2 className="font-headline-lg-mobile text-on-surface mb-stack-sm">댓글 {comments.length}</h2>
          <div className="flex flex-col gap-3 mb-stack-md">
            {comments.length === 0 ? (
              <p className="text-on-surface-variant font-body-md">첫 댓글을 남겨보세요.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="font-label-sm text-on-surface-variant mb-1">{c.authorNickname}</p>
                  <p className="font-body-md text-on-surface whitespace-pre-line">{sanitizeForDisplay(c.body)}</p>
                </div>
              ))
            )}
          </div>
          <CommentForm postId={post.id} />
        </section>
      </div>
    </AppShell>
  );
}
