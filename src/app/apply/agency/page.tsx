import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { LinkButton } from "@/components/ui";
import { SUPPORT_PHONE, SHOW_PHONE_SUPPORT } from "@/lib/config";

const AGENCIES = [
  { name: "○○종합사회복지관 (예시)", area: "서울 ○○구", phone: "02-000-0000" },
  { name: "○○동 주민센터 복지팀 (예시)", area: "경기 ○○시", phone: "031-000-0000" },
  { name: "사회복지 기관 연계 (예시)", area: "전국", phone: SUPPORT_PHONE },
];

// 기관 대리신청 — 1차 보증인. 접근성 + 사기검증 동시 해결.
export default function AgencyPage() {
  return (
    <AppShell>
      <div className="px-margin-mobile md:px-0 py-stack-md">
        <h1 className="font-headline-xl text-tertiary mb-2">기관을 통해 신청하기</h1>
        <p className="font-body-md text-on-surface-variant mb-stack-md">
          가까운 복지기관의 사회복지사가 동의를 받아 사연을 대신 등록합니다. 기관 보증으로 검증이 빨라집니다.
        </p>

        <div className="flex flex-col gap-4">
          {AGENCIES.map((a) => (
            <article key={a.name} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-soft flex items-center gap-4">
              <div className="bg-tertiary-fixed p-3 rounded-full">
                <Icon name="account_balance" className="text-tertiary" />
              </div>
              <div className="flex-grow">
                <h2 className="font-body-lg font-bold">{a.name}</h2>
                <p className="font-label-sm text-on-surface-variant">{a.area}</p>
              </div>
              {SHOW_PHONE_SUPPORT && (
                <a href={`tel:${a.phone}`} className="flex items-center gap-1 text-primary font-label-sm min-h-touch-target-min px-3">
                  <Icon name="call" /> 연결
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="mt-stack-lg text-center">
          <p className="font-body-md text-on-surface-variant mb-3">어느 기관에 연락해야 할지 모르시겠나요?</p>
          <LinkButton href={`/apply`} variant="outline">
            다른 신청 방법 보기
          </LinkButton>
        </div>
      </div>
    </AppShell>
  );
}
