import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-margin-mobile gap-4">
      <Icon name="sentiment_dissatisfied" size={56} className="text-on-surface-variant" />
      <h1 className="font-headline-lg text-on-surface">페이지를 찾을 수 없어요</h1>
      <p className="font-body-md text-on-surface-variant">요청하신 페이지가 없거나 후원이 마감되었을 수 있습니다.</p>
      <Link
        href="/"
        className="bg-secondary text-on-secondary font-button-text px-6 min-h-touch-target-min flex items-center rounded-xl"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
