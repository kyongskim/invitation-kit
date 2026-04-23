# ADR 004 · `share.buttons` 스키마 — 배열이 아닌 고정 시그니처

- 상태: Accepted
- 날짜: 2026-04-24
- 관련: `docs/adr/002-config-driven-approach.md`, `.claude/rules/kakao-sdk.md` (공유 템플릿 원칙)

---

## 맥락 (Context)

3주차 회고(`docs/retrospective/week-03.md`)에서 식별한 잠재 갭. 카카오톡 공유 카드 내 버튼(`Kakao.Share.sendDefault` 의 `buttons` 파라미터) 을 `invitation.config.ts` 로 노출해야 4주차의 공유 섹션·Venue 지도 버튼을 config-driven 원칙 위에서 구현할 수 있다.

제약 조건은 이미 `.claude/rules/kakao-sdk.md` 의 "공유 템플릿 원칙" 섹션에 수립되어 있다:

- buttons 는 **2개 이하**로 유지
- 1번: `"청첩장 보기"` → `meta.siteUrl`
- 2번: (선택) `"지도 보기"` → `https://map.kakao.com/link/to/{name},{lat},{lng}`
- 커스텀 템플릿은 Kakao 콘솔 등록·심사가 필요해 OSS 맥락에서 배제

스키마 표현 방식으로 두 선택지가 있었다:

1. **자유 배열** — `buttons?: { label: string; url: string }[]`
2. **고정 시그니처** — `buttons?: { site?: {...}; map?: {...} }`

## 결정 (Decision)

**고정 시그니처**(`buttons?: { site?, map? }`)로 간다. URL 은 스키마에 두지 않고 `meta.siteUrl` / `venue.coords` 에서 구현이 자동 유도한다. 사용자는 `enabled` 와 `label` 만 커스터마이즈한다.

```ts
buttons?: {
  site?: { enabled?: boolean; label?: string };
  map?: { enabled?: boolean; label?: string };
};
```

기본값: 필드 미설정 시 `site.enabled = true`, `map.enabled = false`. 라벨 기본값("청첩장 보기" / "지도 보기") 은 **스키마가 아닌 `lib/kakao.ts` 구현부에서 주입** — 후속 태스크 범위.

## 이유

1. **Config-driven 원칙 (CLAUDE.md 원칙 1, ADR 002).** 사용자는 `invitation.config.ts` 한 파일만 건드린다. 카카오맵 딥링크 포맷(`https://map.kakao.com/link/to/{encodeURIComponent(name)},{lat},{lng}`) 은 사용자가 몰라도 되는 구현 세부사항. 배열 방식이면 사용자가 이 포맷을 외워 복사해 넣어야 한다.
2. **단일 진실의 원천.** `venue.coords` / `venue.name` 이 이미 있다. 배열 방식이면 지도 URL 에 좌표가 또 박혀 두 소스가 어긋날 위험.
3. **kakao-sdk.md "2개 이하" 제약과 정합.** 카카오 feed 템플릿 스펙상 buttons 는 2개까지만 렌더된다. 배열의 유연성은 이 컨텍스트에서 실수 여지(3개 이상 추가, 순서 실수) 만 키운다.
4. **YAGNI.** "숙박 예약", "라이브 스트리밍" 등 제3의 버튼 실수요가 들어오면 그때 `buttons.custom?: { label: string; url: string }[]` 같은 확장 필드를 덧붙인다. MVP 범위에 선제 도입하지 않는다.

## 결과 (Consequences)

**긍정:**

- `lib/kakao.ts` 에서 `Kakao.Share.sendDefault` 호출 시 `config.venue.coords` / `config.meta.siteUrl` 을 바로 참조 가능. 4주차 태스크 4(Venue 지도 버튼) · 태스크 5(카카오톡 공유) 의 구현 표면적이 좁아진다.
- 사용자 설정 표면적 최소화 — OSS 배포 맥락에서 "카카오맵 URL 포맷은 뭐냐?" 같은 이슈가 사전에 제거된다.
- 타입 레벨에서 "buttons 는 2개" 가 강제됨. 실수로 3개 이상 넣을 경로 자체가 없다.

**부정 / 주의:**

- **임의 버튼을 원하는 사용자**(예: 주차장 안내 링크 추가) 는 현재 스키마로 불가. 실수요 시점에 확장 필요. 다만 OSS 포크라는 탈출구가 항상 있고, 본 프로젝트의 타깃(한국 결혼식 MVP) 에서는 site + map 두 버튼으로 경험적 대부분이 해결된다고 판단.
- `lib/kakao.ts` 가 "URL 자동 유도" 책임을 지게 된다 → 해당 파일 도입 커밋에서 `invitation.config` 전역 import 패턴을 확립해야 함. `.claude/rules/kakao-sdk.md` 의 "Next.js 통합 패턴" 과 정합.
- `label` 기본값을 스키마에 두지 않아 `lib/kakao.ts` 구현부까지 라벨 기본 문자열의 위치를 추적해야 한다. 문자열 2개라 추적 비용은 미미.

## 후속 작업

- [ ] `lib/kakao.ts` 도입 시 `site`/`map` 소비 로직 구현 (라벨 기본값 주입, 카카오맵 딥링크 조립)
- [ ] `components/sections/Venue.tsx` 에서 `share.buttons.map.enabled` 와 별개로 **Venue 섹션 자체의 지도 버튼**(카카오톡 공유 밖, 페이지 내부 CTA) 을 어떻게 연결할지 결정 — 같은 카카오맵 URL 을 재사용하는 것이 자연스러움
- [ ] 실수요가 들어오면 `buttons.custom[]` 확장 재검토
