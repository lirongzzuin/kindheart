import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";

export default function SubmittedPage() {
  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-lg flex flex-col items-center text-center gap-stack-md min-h-[60vh] justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <Icon name="how_to_reg" fill size={44} className="text-white" />
        </div>
        <h1 className="font-headline-xl text-primary">사연이 접수되었습니다</h1>
        <p className="font-body-lg text-on-surface-variant max-w-[480px]">
          증빙 검증과 심사를 거쳐 공개됩니다. 진행 상황은 알림톡으로 안내드립니다. 금액이 큰 사연은 화상
          인터뷰가 진행될 수 있습니다.
        </p>
        <LinkButton href="/" variant="primary" icon="home">
          홈으로
        </LinkButton>
      </div>
    </AppShell>
  );
}
