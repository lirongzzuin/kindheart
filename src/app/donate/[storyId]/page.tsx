import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/Icon";
import { Badge, LinkButton } from "@/components/ui";
import { getStoryById } from "@/lib/mock-data";
import { FEATURES, SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";

// Step: 후원 방식 선택. 절대원칙 #1·#2 — A/B 를 시각적으로 강하게 분리.
export default function DonateModePage({ params }: { params: { storyId: string } }) {
  const story = getStoryById(params.storyId);
  if (!story) notFound();

  return (
    <AppShell hideChrome>
      <AuthGate reason="후원">
      <div className="px-margin-mobile md:px-0 py-stack-md">
        {/* 진행 표시 */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-headline-md text-primary">Step 1. 후원 방식 선택</span>
            <span className="font-label-md text-on-surface-variant">1 / 2 단계</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-1/2 transition-all duration-700" />
          </div>
        </div>

        <section className="mb-10 text-center">
          <h1 className="font-headline-xl text-on-surface mb-3">어떻게 도와드릴까요?</h1>
          <p className="font-body-lg text-on-surface-variant max-w-lg mx-auto">
            <span className="font-bold">&ldquo;{story.title}&rdquo;</span> 사연을 후원합니다.
          </p>
        </section>

        <div className="flex flex-col gap-8">
          {/* Mode B — 지정 후원 (Phase 1 활성) */}
          <article className="group relative bg-surface-container-lowest border border-outline-variant/40 rounded-4xl p-7 md:p-9 shadow-soft hover:shadow-elevated transition-all duration-500 overflow-hidden bg-pattern">
            <div className="relative flex flex-col gap-7">
              <div className="flex justify-between items-start gap-3">
                <div className="w-16 h-16 btn-gradient text-on-secondary rounded-3xl flex items-center justify-center shadow-cta group-hover:scale-105 transition-transform duration-500">
                  <Icon name="handshake" size={36} />
                </div>
                <Badge tone="neutral" icon="info">
                  세액공제 제외
                </Badge>
              </div>
              <div>
                <h2 className="font-headline-lg text-secondary mb-1">특정인 후원하기</h2>
                <p className="text-secondary/70 font-label-md mb-3">1:1 직접 연결을 통한 변화</p>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  내가 고른 사연의 주인공에게 직접 후원합니다. 후원금은 분할 지급되고, 사용 내역을 끝까지 투명하게
                  확인할 수 있습니다. 개인 간 직접 도움이라 세액공제는 제공되지 않습니다.
                </p>
              </div>
              <LinkButton href={`/donate/${story.id}/pay`} variant="secondary" icon="arrow_forward" className="w-full h-16">
                이 사연 후원 시작하기
              </LinkButton>
            </div>
          </article>

          {/* Mode A — 세액공제 기부 (FEATURE_MODE_A) */}
          {FEATURES.MODE_A ? (
            <article className="group relative bg-surface-container-lowest border border-outline-variant/40 rounded-4xl p-7 md:p-9 shadow-soft hover:shadow-elevated transition-all duration-500 overflow-hidden bg-pattern">
              <div className="relative flex flex-col gap-7">
                <div className="flex justify-between items-start gap-3">
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-3xl flex items-center justify-center shadow-cta group-hover:scale-105 transition-transform duration-500">
                    <Icon name="account_balance" size={36} />
                  </div>
                  <Badge tone="verified" icon="receipt_long">
                    연말정산 혜택
                  </Badge>
                </div>
                <div>
                  <h2 className="font-headline-lg text-primary mb-1">기부하기</h2>
                  <p className="text-primary/70 font-label-md mb-3">공익 기금을 통한 가치 실천</p>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    공익법인이 운영하는 펀드에 기부합니다. 특정인을 지정할 수는 없지만, 검증된 기관이 가장 필요한 곳에
                    배분하고 <strong>기부금영수증</strong>을 발행합니다.
                  </p>
                </div>
                <LinkButton href="/donate/fund" variant="primary" icon="arrow_forward" className="w-full h-16">
                  기부할 펀드 고르기
                </LinkButton>
              </div>
            </article>
          ) : (
            <div className="bg-surface-container-low border border-dashed border-outline/40 rounded-4xl p-8 text-center">
              <Icon name="schedule" className="text-on-surface-variant" size={32} />
              <p className="font-body-md text-on-surface-variant mt-3">
                세액공제가 가능한 <b>기부 펀드</b>는 공익법인 제휴 후 곧 제공될 예정입니다.
              </p>
            </div>
          )}
        </div>

        {SHOW_PHONE_SUPPORT && (
          <div className="mt-12 border-t border-outline-variant/30 pt-8 flex flex-col items-center">
            <p className="font-body-md text-on-surface-variant mb-4">어떤 방식이 좋을지 고민되시나요?</p>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 px-6 h-12 text-primary font-label-md border-2 border-primary/20 rounded-full hover:bg-primary hover:text-on-primary transition-all tap-scale"
            >
              <Icon name="support_agent" size={20} /> 고객센터 {SUPPORT_PHONE}
            </a>
          </div>
        )}
      </div>
      </AuthGate>
    </AppShell>
  );
}
