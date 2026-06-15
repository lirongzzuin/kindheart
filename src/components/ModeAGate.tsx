import { AppShell } from "./AppShell";
import { Icon } from "./Icon";
import { LinkButton } from "./ui";

/** Mode A 비활성(공익법인 설립 전) 시 보여줄 안내. 404 대신 친절 고지. */
export function ModeAComingSoon() {
  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-lg flex flex-col items-center text-center gap-stack-md min-h-[50vh] justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center">
          <Icon name="verified_user" fill size={44} className="text-primary" />
        </div>
        <h1 className="font-headline-xl text-primary">세액공제 기부, 곧 만나요</h1>
        <p className="font-body-lg text-on-surface-variant max-w-[520px]">
          연말정산 세액공제가 가능한 <b>불특정 다수 기부</b>는 공익법인 설립·기부금품모집 등록 절차를 마친 뒤
          제공됩니다. 그동안에도 <b>특정 사연 직접 후원</b>은 언제든 가능합니다.
        </p>
        <LinkButton href="/browse" variant="secondary" icon="favorite">
          사연 둘러보기
        </LinkButton>
      </div>
    </AppShell>
  );
}
