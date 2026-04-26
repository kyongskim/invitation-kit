"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 신랑·신부 + Hero 배경. 양가 부모 정보 (father/mother) 도 동일 form 안.
 * config.groom · config.bride · config.hero 1 단계 nested 갱신.
 */
export function MainForm() {
  const groom = useEditorStore((s) => s.config.groom);
  const bride = useEditorStore((s) => s.config.bride);
  const hero = useEditorStore((s) => s.config.hero);
  const setField = useEditorStore((s) => s.setField);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-primary font-serif text-lg">메인 · 신랑 신부</h2>

      <div className="flex flex-col gap-4">
        <h3 className="text-secondary text-xs tracking-wider uppercase">
          신랑
        </h3>
        <Field
          label="이름"
          value={groom.name}
          onChange={(v) => setField("groom", { ...groom, name: v })}
        />
        <Field
          label="순서"
          value={groom.order ?? ""}
          onChange={(v) => setField("groom", { ...groom, order: v })}
          placeholder="장남, 차남 등"
        />
        <Field
          label="아버지"
          value={groom.father ?? ""}
          onChange={(v) => setField("groom", { ...groom, father: v })}
        />
        <Field
          label="어머니"
          value={groom.mother ?? ""}
          onChange={(v) => setField("groom", { ...groom, mother: v })}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-secondary text-xs tracking-wider uppercase">
          신부
        </h3>
        <Field
          label="이름"
          value={bride.name}
          onChange={(v) => setField("bride", { ...bride, name: v })}
        />
        <Field
          label="순서"
          value={bride.order ?? ""}
          onChange={(v) => setField("bride", { ...bride, order: v })}
          placeholder="장녀, 차녀 등"
        />
        <Field
          label="아버지"
          value={bride.father ?? ""}
          onChange={(v) => setField("bride", { ...bride, father: v })}
        />
        <Field
          label="어머니"
          value={bride.mother ?? ""}
          onChange={(v) => setField("bride", { ...bride, mother: v })}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-secondary text-xs tracking-wider uppercase">
          Hero 배경
        </h3>
        <Field
          label="배경 이미지 경로"
          value={hero?.backgroundImage ?? ""}
          onChange={(v) =>
            setField(
              "hero",
              v ? { backgroundImage: v, alt: hero?.alt } : undefined,
            )
          }
          placeholder="/images/gallery/sample-01.jpg"
          hint="비우면 cream 단색 배경 + 진한 텍스트로 폴백"
        />
        <Field
          label="대체 텍스트 (alt)"
          value={hero?.alt ?? ""}
          onChange={(v) =>
            hero
              ? setField("hero", { ...hero, alt: v })
              : setField("hero", { backgroundImage: "", alt: v })
          }
          placeholder="결혼식 메인 사진"
        />
      </div>
    </section>
  );
}
