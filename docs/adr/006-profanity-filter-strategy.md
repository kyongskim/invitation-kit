# ADR 006 · 욕설 필터 강화 — 자음 변형 보강 배열 + 외부 패키지 보류

- 상태: Accepted
- 날짜: 2026-04-25
- 관련: `.claude/rules/firebase.md` (욕설 필터 섹션), `lib/profanity.ts`, `docs/00-roadmap.md` Week 8

---

## 맥락 (Context)

8주차 방명록 출시 직후 (2026-04-25) 사용자 자체 검수에서 **자음 변형 우회 사례** 가 보고됐다.

- "ㅅㅂ" 입력 → 통과 (필터 미동작)
- "시발" 입력 → 차단 (정상 동작)

원인: 현재 `lib/profanity.ts` 의 `PROFANITY_LIST` 는 `yoonheyjung/badwords-ko` (MIT, 574 단어) 의 원본 스냅샷 그대로다. 이 원본은 정상 한글 표기 (시발·씨발·개새끼 등) 위주이고, 한국어권에서 매우 흔한 자음만 줄임 ("ㅅㅂ", "ㅂㅅ", "ㅈㄴ" 등) 은 포함돼 있지 않다.

`containsProfanity` 의 매치 로직은 단순 substring (`String.prototype.includes`) 이라, 자음 변형은 원본 단어와 한 글자도 겹치지 않아 필연적으로 통과한다.

`.claude/rules/firebase.md` 의 욕설 필터 섹션은 처음부터 이 한계를 인지하고 있었다:

> 변형·confusable 정규화는 도입 안 함 — false positive 와 유지 비용 증가. 필요해지는 시점이 오면 별도 lib 또는 외부 패키지 (예: Tanat05/korcen Apache-2.0) 도입을 별도 결정으로 검토.

> badwords-ko 가 잡지 못한 변형 · 정상 단어 false positive 모두 [Console 수동 삭제] 경로로 보완.

이번 보고가 바로 그 "필요해지는 시점" 이다. 청첩장 OSS 템플릿이 v0.1 → v0.2 로 가는 길목에서 "흔한 자음 줄임말 1개 통과" 는 신뢰 비용이 크다 — 결혼식 방명록은 메시지 1건 1건이 가족·지인 사이의 social proof 역할이라, 그 사이에 욕이 끼면 운영자가 콘솔로 지우기 전까지 다른 손님들에게 노출된다.

## 검토한 대안

### A. 흔한 자음 변형을 별도 배열로 추가 (채택)

```ts
const PROFANITY_LIST: readonly string[] = [...]; // badwords-ko 원본 574 (변경 없음)
const ADDITIONAL_PROFANITY: readonly string[] = [
  "ㅅㅂ", "ㅆㅂ", "ㅂㅅ", "ㅄ", "ㅈㄴ", "ㅈㄹ", "ㄲㅈ", "ㅁㅊ", "ㅈ밥", "ㅈ까",
];
const ALL_PROFANITY = [...PROFANITY_LIST, ...ADDITIONAL_PROFANITY];
```

- **장점**: 의존성 0, bundle delta ~0, 즉시 효과, 라이선스 영향 없음. 원본 스냅샷 (574, 순서 유지) 과 자체 추가가 **물리적으로 분리** 돼 미래 badwords-ko sync 시점에 충돌 없음.
- **단점**: whack-a-mole — 새로운 변형이 등장하면 또 추가해야 함. 변형의 조합 폭이 넓어 100% 커버리지 불가.
- **단점 평가**: 결혼식 청첩장 맥락에서 의도적 우회는 드물고 (실명 문화 + 비개발자 하객), 빠진 변형은 여전히 "운영자 Console 수동 삭제" 경로로 보완 가능. **80/20** 으로 충분.

### B. 외부 패키지 도입 (`Tanat05/korcen` Apache-2.0 등) (거부)

- **장점**: 자음 분리·confusable 정규화·로마자 매핑 등 변형 검출이 한국어 욕설에 특화돼 자동 처리. 유지보수 외부화.
- **거부 근거**:
  1. **의존성 비용**: 현재 lib/\* 전부 자체 구현 (`lib/profanity.ts` 도 `badwords-ko` 데이터만 내재화하고 코드는 자체). 외부 패키지 도입 시 첫 사례.
  2. **라이선스 마찰**: `korcen` 은 Apache-2.0 — 본 프로젝트 MIT 와 호환되지만 NOTICE 파일 추가 의무가 발생할 수 있음. badwords-ko 의 MIT 처럼 "데이터만 내재화 + 라이선스 헤더 주석" 의 가벼운 처리가 안 됨.
  3. **bundle 영향 미측정**: korcen 은 한글 자모 분해·변형 매트릭스를 내장해 수십 KB 단위. 청첩장 1 페이지 SPA 의 critical path 에 추가하기엔 무겁다.
  4. **유지보수 외부화의 양면성**: 외부 패키지가 잘 유지보수되는 동안엔 좋지만, 한 번 stale 해지면 fork 해야 함. 데이터 array 가 무엇인지 명확한 자체 구현 (badwords-ko 원본 + 자체 ADDITIONAL_PROFANITY) 이 OSS 템플릿 사용자에게도 투명.
  5. **현재 사용 강도와 불일치**: korcen 의 강력한 매칭은 게임 채팅·SNS 같은 high-volume 환경에 어울리고, 결혼식 청첩장의 single-digit 작성자 환경엔 과한 수준.

### C. 자음 분리 정규화 자체 구현 (거부)

"ㅅㅂ" 을 보면 자음 분리 후 한글 자모 매핑으로 "시발" 등 후보를 생성해 매칭하는 식. 알고리즘 직접 작성.

- **거부 근거**: 자체 구현 복잡도가 ADDITIONAL_PROFANITY 직접 추가 대비 10x 이상이고, 청첩장 스코프에서 그만한 알고리즘 자산을 lib/\* 에 두는 것은 over-engineering. 강력한 변형 검출이 정말 필요해지는 순간엔 B 의 외부 패키지를 채택하는 게 자체 구현보다 합리적이다.

### D. 욕설 필터 강화 자체 보류 (거부)

"운영자 Console 수동 삭제로 충분하니 추가 작업 안 함" 도 합리적 선택지. 결혼식 청첩장은 작성자가 적고 실명 문화라 의도적 우회가 드물다.

- **거부 근거**: "ㅅㅂ" 같은 흔한 줄임말 1개를 잡지 못한다는 사실 자체가 OSS 템플릿 사용자 (다른 커플) 에게 "이 필터가 작동하나?" 라는 신뢰 손실을 일으킨다. 추가 비용이 거의 0 인 A 가 가용하므로 D 를 선택할 동기 없음.

## 결정 (Decision)

### 1. `ADDITIONAL_PROFANITY` 배열 신설 — `lib/profanity.ts`

`PROFANITY_LIST` (badwords-ko 원본 574, 순서 유지) 는 그대로 두고, 한국어 자음 변형용 별도 배열을 같은 파일에 추가한다. 두 배열 분리는 **세 가지 의도**:

1. **원본 sync 호환**: badwords-ko upstream 갱신 시 `PROFANITY_LIST` 만 통째로 교체하는 패턴 유지.
2. **출처 추적성**: 자체 추가 항목과 외부 데이터 항목을 git blame · 라이선스 측면에서 분리해 추적.
3. **MIT 라이선스 의무 분리**: badwords-ko 의 MIT 라이선스 헤더 주석은 `PROFANITY_LIST` 영역에 한정, `ADDITIONAL_PROFANITY` 는 본 프로젝트 자체 데이터로 구분 표시.

### 2. 초기 자음 변형 셋 (10 항목)

```
ㅅㅂ, ㅆㅂ, ㅂㅅ, ㅄ, ㅈㄴ, ㅈㄹ, ㄲㅈ, ㅁㅊ, ㅈ밥, ㅈ까
```

선별 기준:

- **흔도**: 한국어권 인터넷에서 십수 년간 안정적으로 사용된 줄임말만 포함. minor variants (예: "ㅅㅂㄹㅁ") 는 최초 셋에 미포함, 실제 사례 등장 시 추가.
- **false positive 안전**: 일반 메시지에 우연히 포함될 가능성이 매우 낮은 자음 조합. 다음은 **의식적으로 제외**:
  - `ㅗ` — single-char, 너무 짧고 자음 없는 텍스트에 우연 결합 가능성.
  - `ㄴㄴ` — "노노" (욕 아님).
  - `ㅈㅅ` — "죄송".
  - `ㅂㄹ` — "별로".
  - `ㅂㅂ` — "바이바이".

### 3. `containsProfanity` 의 두 배열 통합 검사

```ts
export function containsProfanity(text: string): boolean {
  const normalized = text.replace(/\s+/g, "");
  return (
    PROFANITY_LIST.some((word) => normalized.includes(word)) ||
    ADDITIONAL_PROFANITY.some((word) => normalized.includes(word))
  );
}
```

`some` 단락 평가로 short-circuit. 두 배열 합쳐 `[...PROFANITY_LIST, ...ADDITIONAL_PROFANITY]` 한 번 만들고 .some 단발 호출 패턴 대신 **호출별 두 .some** 을 선택한 이유: 매 호출마다 새 배열 생성 회피 (GC pressure 작지만 의미 0 비용). 모듈 스코프 합본 배열 생성은 가능하지만 가독성 이득보다 분리 의도 흐림 손실이 크다.

### 4. 외부 패키지 (B) 는 v1.1+ 후보로 명시 보류

본 ADR 의 거부는 "현재 시점" 한정. 다음 조건 중 하나가 충족되면 재검토:

- 실사용자 (다른 커플) 가 자체 운영 중 30 단어 이상 변형 필터 우회 사례 보고
- v1.1 의 RSVP / 댓글 등 작성자 수가 1 청첩장당 100 명 이상으로 늘어남
- ADDITIONAL_PROFANITY 배열이 50 항목을 초과해 자체 유지비용이 상승

### 5. `.claude/rules/firebase.md` 욕설 필터 섹션 갱신

기존 단어 데이터 출처 메모 옆에 "자체 추가 데이터" 섹션 신설. ADR 006 으로 링크. "변형·confusable 정규화는 도입 안 함" 문장은 "외부 패키지 기반 변형 검출은 도입 안 함, 자음 변형 한정 직접 추가" 로 수정.

## 결과 (Consequences)

### 긍정

- "ㅅㅂ" / "ㅂㅅ" 등 가장 흔한 자음 우회 즉시 차단. 의존성 0.
- 원본 sync 정책과 자체 보강 분리되어 두 흐름 모두 안정.
- ADR 006 자체가 "외부 패키지 검토했고 거부" 의 명시적 기록 — 미래 기여자가 "왜 korcen 안 썼지?" 질문 시 답할 문서.

### 부정 / 주의

- **whack-a-mole 위험**: 새 변형 등장 시마다 코드 변경 + 커밋 필요. ADDITIONAL_PROFANITY 가 30~50 항목으로 부풀면 ADR 재검토 트리거.
- **ADDITIONAL_PROFANITY 추가 시 false positive 검증 필요**: PR 또는 커밋 단위로 새 항목이 일반 메시지를 오탐하지 않는지 빠르게 확인 (브라우저 콘솔에서 `containsProfanity(메시지)` 직접 호출).
- **이 ADR 은 자체 구현 (C) 도 거부했다**: 미래에 자음 분해 정규화를 직접 짜고 싶어지는 유혹이 오면, 그 시점엔 외부 패키지 (B) 가 더 합리적 선택임을 상기.

## 참고

- `.claude/rules/firebase.md` — 욕설 필터 섹션 (본 ADR 으로 링크 추가)
- `lib/profanity.ts` — 구현 위치
- `yoonheyjung/badwords-ko` (MIT) — 원본 데이터 출처, https://github.com/yoonheyjung/badwords-ko
- `Tanat05/korcen` (Apache-2.0) — 거부된 외부 패키지 후보, https://github.com/Tanat05/korcen
