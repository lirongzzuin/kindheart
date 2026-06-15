"use client";
/** 카테고리 필터 + 사연 리스트. 홈/둘러보기 공용. */
import { useState } from "react";
import { CATEGORY_LABEL, Story, StoryCategory } from "@/lib/types";
import { StoryCard } from "./StoryCard";

const FILTERS: { key: StoryCategory | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "medical", label: CATEGORY_LABEL.medical },
  { key: "emergency", label: CATEGORY_LABEL.emergency },
  { key: "independence", label: CATEGORY_LABEL.independence },
  { key: "living", label: CATEGORY_LABEL.living },
];

export function StoryBrowser({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState<StoryCategory | "all">("all");
  const filtered = active === "all" ? stories : stories.filter((s) => s.category === active);

  return (
    <>
      <section
        className="px-margin-mobile md:px-0 mb-8 overflow-x-auto pb-2 hide-scrollbar"
        aria-label="카테고리 필터"
      >
        <div className="flex gap-2 md:justify-center min-w-max" role="tablist">
          {FILTERS.map((f) => {
            const on = active === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(f.key)}
                className={`px-5 h-11 rounded-full font-label-md whitespace-nowrap border transition-colors tap-scale ${
                  on
                    ? "bg-primary text-on-primary border-primary shadow-soft"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/50 hover:bg-surface-container"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="px-margin-mobile md:px-0 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-stack-lg"
        aria-live="polite"
      >
        {filtered.length === 0 ? (
          <p className="text-on-surface-variant font-body-md py-stack-lg text-center col-span-full">
            해당 카테고리의 사연이 아직 없습니다.
          </p>
        ) : (
          filtered.map((s) => <StoryCard key={s.id} story={s} />)
        )}
      </section>
    </>
  );
}
