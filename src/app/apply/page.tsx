import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";
import { SUPPORT_HOURS, SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";

// 사연 신청 — 3채널 (본인직접 / 기관대리 / 비디지털). 접근성 법적 필수.
export default function ApplyPage() {
  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md flex flex-col gap-stack-lg">
        <section className="text-center">
          <h1 className="font-headline-xl text-primary mb-2">사연 신청하기</h1>
          <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
            어려운 상황을 혼자 고민하지 마세요. 가장 편한 방법으로 신청하시면 됩니다.
          </p>
        </section>

        <div className="flex flex-col gap-6">
          {/* 1. 직접 신청 */}
          <article className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-soft flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary-fixed p-5 rounded-full min-w-[80px] min-h-[80px] flex items-center justify-center">
              <Icon name="edit_note" className="text-primary" size={40} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="font-headline-lg-mobile text-primary">직접 신청하기</h2>
              <p className="font-body-md text-on-surface-variant">
                앱에서 단계별 질문에 답하며 작성합니다. 관련 서류 사진도 첨부할 수 있어요.
              </p>
            </div>
            <LinkButton href="/apply/write" variant="primary" className="w-full md:w-auto">
              지금 작성하기
            </LinkButton>
          </article>

          {/* 2. 기관 대리 (권장) */}
          <article className="bg-surface-container-lowest p-6 rounded-2xl border-2 border-tertiary/40 shadow-soft flex flex-col md:flex-row items-center gap-6">
            <div className="bg-tertiary-fixed p-5 rounded-full min-w-[80px] min-h-[80px] flex items-center justify-center">
              <Icon name="account_balance" className="text-tertiary" size={40} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="inline-flex items-center gap-1 bg-tertiary text-on-tertiary px-2 py-0.5 rounded font-label-sm text-sm mb-1">
                <Icon name="recommend" size={16} /> 가장 권장
              </div>
              <h2 className="font-headline-lg-mobile text-tertiary">기관을 통해 신청하기</h2>
              <p className="font-body-md text-on-surface-variant">
                복지관·주민센터 사회복지사의 도움을 받아 신청합니다. 기관이 보증해 더 빠르게 검증됩니다.
              </p>
            </div>
            <LinkButton href="/apply/agency" variant="outline" className="w-full md:w-auto">
              기관 찾기
            </LinkButton>
          </article>

          {/* 3. 전화 (비디지털 대체수단) — 콜센터 가동 전 우선 숨김 */}
          {SHOW_PHONE_SUPPORT && (
            <article className="bg-secondary-fixed p-8 rounded-2xl border-2 border-secondary shadow-soft flex flex-col items-center text-center gap-6">
              <div className="bg-secondary p-5 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                <Icon name="phone_in_talk" className="text-white" size={44} />
              </div>
              <div>
                <h2 className="font-headline-xl text-secondary">전화로 신청하기</h2>
                <p className="font-body-lg text-on-secondary-container mt-2 font-semibold">
                  상담원이 전화로 사연을 대신 작성해 드립니다.
                </p>
              </div>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex flex-col items-center justify-center bg-secondary text-white w-full max-w-sm py-6 rounded-2xl shadow-md active:scale-[0.98] transition-transform"
              >
                <span className="font-label-sm opacity-90">무료 상담 전화</span>
                <span className="font-headline-xl tracking-widest">{SUPPORT_PHONE}</span>
              </a>
              <p className="font-label-sm text-on-secondary-fixed-variant">운영시간: {SUPPORT_HOURS}</p>
            </article>
          )}
        </div>

        <section className="bg-surface-variant/30 p-8 rounded-2xl border border-dashed border-outline text-center">
          <Icon name="security" className="text-primary/60" size={40} />
          <p className="font-body-md text-on-surface-variant mt-2">
            귀하의 개인정보는 암호화되어 보호되며, 오직 지원 검토 목적으로만 사용됩니다.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
