# Week 9 회고 — v0.2 릴리스 + 비개발자 배포 가이드 3종 + 회고 우선 태스크 일괄 마감

**기간:** 2026-04-25 (Day 1 ~ Day 2 압축 진행)
**누적 커밋:** 10 건 (본 회고 커밋 제외)
**태그:** `v0.2.0` 신규 (Latest)
**진행도:** 9/12 주 (75%)

---

## 🎯 이번 주차 핵심

8주차 마지막 푸시 (`2ca5aee`) 이후 누적 12 커밋을 **`v0.2.0`** 으로 닫고, "비개발자 5분 배포" 약속의 본격 준비 — `docs/{api-keys,config-guide,theme-guide}.md` 3종을 완성. 부수적으로 8주차 회고에서 "다음 주차로 넘긴" 우선 태스크 6 항목을 **모두 처리** (일부는 가설 자체 정정). v0.2 직후 Vercel 환경변수 등록 누락이라는 운영 갭 1 건 발견·정정 (`firebase.md` 영구화).

---

## ✅ 8주차 회고 우선 태스크 6 항목 결과

| #   | 항목                                                     | 결과                                                                                                                                | 처리 커밋 / 호흡                          |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | v0.2 태그 + GitHub Release                               | ✅ 완료 — `v0.2.0` annotated tag + Release 본문 (한국어 primary + 영문 summary) Latest 공개                                         | `aa122f8` (Day 1)                         |
| 2   | 가이드 3종 (`api-keys` · `config-guide` · `theme-guide`) | ✅ 완료 — 총 812 줄 (Prettier 포맷 후)                                                                                              | `1851f89` · `212fd04` · `988e5a8` (Day 2) |
| 3   | 구글 캘린더 실기기 검증                                  | ✅ 통과 — 사용자 자가 검증 (Android Chrome / iOS Safari, KST 12:00 정상)                                                            | Day 2 사용자 영역                         |
| 4   | `firebase.md` set-state-in-effect 메모 톤 격상           | ✅ 완료 — "주의" → "절대 금지" + fetch effect 초기 state 패턴 명시                                                                  | `05f13fc` (Day 1)                         |
| 5   | `gh run` polling 허용 settings 명시                      | ✅ **가설 자체 정정** — settings 변경 불필요. 정답은 Monitor 도구 채택 (1순위) → Bash `run_in_background` + `until` 루프 (fallback) | `c1e5348` (Day 2 fact-check)              |
| 6   | Quality gate 표준 시퀀스 (`format:check` 포함)           | ✅ 완료 — CLAUDE.md 라인 94 에 명시                                                                                                 | `c58b50f` (Day 1)                         |

---

## 📋 실제 결과물 (커밋 10 건)

### Day 1 — 회고 닫힘 + v0.2 릴리스 + 운영 갭 정정

- **`b2af838` docs(format)** — 8주차 회고 + 로드맵 Prettier 포맷 정리. 8주차 마지막 푸시 (`06a8f1f` · `072ac35`) 가 stage 누락으로 CI 빨간불이었던 갭 fix-forward.
- **`c58b50f` docs(claude)** — 표준 quality gate 시퀀스 (`rm -f .eslintcache && lint && typecheck && format:check && build`) CLAUDE.md 명시. 회고 우선 6번.
- **`aa122f8` docs(release): v0.2.0** — `CHANGELOG.md` `[0.2.0]` 섹션 (Added 6 카테고리 · Changed 2 · Decisions 2 · Known Limitations 4 · Not yet 7), `package.json` version `0.1.0 → 0.2.0`, annotated tag, GitHub Release `v0.2.0 — 다중 테마 · 구글 캘린더 · Firebase 방명록` Latest 공개. 7주차 v0.1.0 패턴 (`b629ba6`) 그대로 미러.
- **`b3ec400` docs(rules)** — `firebase.md` 환경변수 섹션 + Console 설정 8 단계 + Gotcha 에 "**Vercel Environment Variables 6 키 등록 + Production·Preview 체크 + 재배포**" 명시. **9주차 v0.2 직후 dev 만 동작 / prod 작성 실패 사례** 발화 후 영구화.
- **`05f13fc` docs(rules)** — `firebase.md` 의 set-state-in-effect 메모 톤 격상. 5주차→6주차→8주차 3 회 재발 후 회고 격상 결정.

### Day 2 — 비개발자 배포 가이드 3종 + 회고 우선 5번 정정

- **`1851f89` docs(guide): `api-keys.md`** (204 줄) — 카카오 + Firebase 키 발급, 카카오 도메인 2 필드 등록표, Firebase Console 핵심 4 가지 (Standard / asia-northeast3 / 프로덕션 모드 / Hosting 체크 해제), `.env.local` + Vercel Production·Preview + 재배포, 흔한 실수 5건 (9주차 v0.2 사례 포함).
- **`212fd04` docs(guide): `config-guide.md`** (394 줄) — `invitation.config.ts` 11 top-level 키 전수. 표 + 외부 setup 박스 + 운영 시점 변형 패턴 (좌표 얻는 법 · 부모 한 분만 표기 · 양가 빈 배열 · iOS 자동재생 차단 · CLS 방지 · `share.buttons` 활성 조합 표). 검증 체크리스트는 표준 quality gate 시퀀스 그대로.
- **`988e5a8` docs(guide): `theme-guide.md`** (214 줄) — 9 변수 토큰 카탈로그, 4 번째 테마 (`vintage` 가상 시나리오) 추가 5 단계, Modern worked example (디자인 의도 + 변경 토큰 7개 + 실제 코드), Floral 짧은 노트 (Modern 의 1/3 분량), 디자인 결정 가이드 (WCAG AA · `--font-serif` 한국어 미지원 · `--radius-sm` 효과 범위), Gotcha 5건. ADR 005 가 결정 배경을 다루므로 본 가이드는 worked example + 토큰 표에 집중.
- **`b934f9b` docs(format)** — 가이드 3종 Prettier 포맷 정리. 직전 3 커밋 stage 누락이 8주차 동일 패턴 (`b2af838`) 으로 재발.
- **`c1e5348` docs(retro)** — 8주차 회고 우선 태스크 5번에 9주차 fact-check 결과 sub-bullet 4 줄 추가. 가설 ("settings 추가") 보존하고 정정 결과 (Monitor 도구 → Bash fallback) 인라인.

---

## 🎁 보너스 발견·산출물

회고 우선 태스크 6 항목 외 본 주차에 자연 발생한 부산물:

1. **Vercel Environment Variables 등록 누락 사례 (Day 1)** — `aa122f8` 직후 사용자 자가 점검에서 "dev 는 정상, prod 방명록 작성 실패" 증상 발생. 진단: `NEXT_PUBLIC_*` 변수가 빌드 시점 인라인이라 `.env.local` 만으론 prod 빌드에 반영 안 됨. 사용자 Vercel 등록 + Redeploy 후 정상화. 이 경험을 `firebase.md` 의 환경변수 섹션 + Console 설정 8 단계 + Gotcha 에 영구화 (`b3ec400`). `api-keys.md` 흔한 실수 1번에도 동일 사례 인용.

2. **Monitor 도구 거부 케이스 (Day 2)** — `gh run list` polling 위해 Monitor 호출 시 권한 거부 1 회 (메시지는 push 룰로 표시됐는데 명령은 read-only). Bash `run_in_background` + `until` 루프로 즉시 fallback, 동작 정상. 8주차 회고 우선 태스크 5번 fact-check 에 추가 finding 으로 박음.

3. **Prettier `format:check` 누락 재발 (Day 2)** — 가이드 3 커밋 모두 stage 누락. `b934f9b` 로 fix-forward. 8주차 `b2af838` 와 정확히 동일 패턴이라 CLAUDE.md 라인 94 의 표준 시퀀스가 _없었더라면_ 또 흐릿했을 거란 메타 검증.

---

## 💡 배운 것

### 1. 가설은 가설로 보존, 정정은 인라인으로

8주차 회고 우선 태스크 5번 ("settings 에 gh run polling 허용 추가") 이 9주차 들어가 점검하니 진단 부정확. 본 호흡에서 한 결정: **회고 본문 가설은 그대로 두고, sub-bullet 으로 fact-check 결과 인라인.** retroactive rewrite 로 가설을 지우면 "8주차 시점 우리 사고가 어땠나" 라는 학습 가치 자체가 사라진다. 미래에 비슷한 가설 반복 시 회고 본문이 trace 자료가 되는 게 맞음.

이건 회고를 "스냅샷 + 후속 패치" 모델로 보는 패턴. 8주차 회고가 9주차에 패치 1 건 받은 첫 사례. 향후 비슷한 가설 정정 발생 시 동일 패턴 (`### N번 9주차 fact-check` sub-bullet) 재사용.

### 2. 운영 갭은 한 사이클 안에서 영구화

`b3ec400` 의 Vercel 환경변수 등록 사례. 사용자가 prod 작성 실패를 발화 → 즉시 진단 → 즉시 `firebase.md` 에 박음 → 즉시 `api-keys.md` 흔한 실수에도 인용 → 본 회고에 보너스 항목으로 정리. **한 사이클 (~30 분) 안에 발견·정정·영구화** 가 끝남. 이 사이클 길이가 운영 사례 수집의 핵심 — 사이클이 길어지면 "지난번에 한 번 막혔던 것" 이라는 흐릿한 기억으로만 남고 영구화 안 됨.

비개발자 가이드 (`api-keys.md`) 가 같은 호흡에 작성 중이었던 점이 결정적 — `firebase.md` 의 디테일이 `api-keys.md` 의 사용자 시점 절차로 바로 자식 노드를 가져 글의 "정확성 ↔ 압축" 트레이드오프가 자연스럽게 정해짐.

### 3. README-Driven Documentation 의 ROI

가이드 3종 작성 자체가 **코드의 정합성 검증** 으로 자연스럽게 이어짐. `config-guide.md` 작성하며 `invitation.config.ts` 의 인라인 코멘트가 짧다는 걸 인식 (다행히 부족하진 않았음). `theme-guide.md` 의 worked example 위해 `app/globals.css` 토큰 카탈로그를 정확히 표로 옮기는 과정에서 9 변수 모두 의도와 일치하는지 재확인. 즉, 사용자 가이드 = 코드 사실의 외부 검증.

이 효과는 `init` 같은 CLAUDE.md 자동 생성과 결이 다름 — 그건 "현 상태의 정리" 고, 이건 "현 상태의 사용자 시점 재기술" 이라 사용자가 어디서 막힐지 시뮬레이션이 동반됨.

### 4. Plan Mode 의 ROI 는 작업 종류에 따라 다르다

본 호흡 Day 2 는 Plan Mode 진입 후 plan 파일에 3 파일 구조 합의 → 실행. 평소 코드 변경의 Plan Mode 와 달리 **문서 작성은 plan 의 가치가 "구조·톤·분량" 합의에 더 집중**됨. Phase 2 의 Plan agent 는 본 호흡에서 skip — 문서 작성은 architecture 결정이 아니라 톤·범위 결정이라 직접 plan 작성이 효율적이었음. 시스템 reminder ("Skip agents: Only for truly trivial tasks") 보다 더 광범위한 skip 가능 영역.

향후 비슷한 doc-only 작업 시 plan 의 핵심: H2 목차 + 분량 목표 + 톤 매칭 reference + cross-link 패턴. 코드 작업과 거의 같은 시간이 들지만 ROI 는 다름.

### 5. 회고 닫음 패턴: 6 항목 모두 한 호흡 안에서 처리 가능

원래 회고 우선 태스크 6 항목은 "9주차 진행 중 점진적으로 처리" 가 자연스러운 그림이었지만 실제로는 **Day 1 + Day 2 압축 진행으로 모두 닫음**. 일부 항목 (1번 v0.2, 2번 가이드 3종) 분량이 컸음에도 가능했던 이유:

- Day 1 의 v0.2 릴리스가 7주차 v0.1.0 패턴 (`b629ba6`) 직접 미러라 재량 결정 0
- 4번·6번이 1줄 수정 / 라인 추가 수준
- 5번이 fact-check 만으로 닫힘 (코드 변경 0)
- 3번이 사용자 자가 검증 (코드 측 작업 0)

남은 큰 덩어리는 2번 가이드 3종 뿐. **회고 우선 태스크의 8 할은 1줄 수정 / 검증 / 회고 정정 같은 small loop**. v1.0 직전 회고 우선 태스크 설계 시 이 비율이 자연스러운 패턴.

---

## 🔢 메트릭

- **9주차 커밋 수 (Day 1 + Day 2)**: 10 개 (본 회고 커밋 제외)
  - 4 docs(guide+rules) · 2 docs(format) · 1 docs(release) · 1 docs(retro) · 1 docs(claude) · 1 docs(rules)
  - **모든 커밋이 docs 계열** — feat/fix/refactor 0. 9주차가 코드 동결 + 문서·릴리스에 집중한 주차였음을 그대로 반영
- **태그 생성**: 1 (`v0.2.0` annotated)
- **GitHub Release**: 1 (Latest)
- **신규 문서**: 3 (`api-keys.md` 204줄 · `config-guide.md` 394줄 · `theme-guide.md` 214줄, 합계 812줄)
- **갱신 문서**: 4 (CLAUDE.md · firebase.md × 2 · CHANGELOG.md)
- **CI 런**: 약 10 회. **빨간불 2 회** (각각 Day 1 / Day 2 의 prettier `format:check` 누락) — fix-forward 1 커밋씩으로 회복. lint/typecheck/build 빨간불 0.
- **외부 기여자**: 0 명
- **의존성 추가**: 0 (8주차 firebase + bcryptjs 그대로)
- **신규 lib 모듈**: 0 (8주차 4 개 그대로)
- **회고 우선 태스크 closure 비율**: 6/6 (100%)

---

## 🚀 v1.0 마일스톤 진척도

| 버전       | 상태            | 시기                | 주요 항목                                                                                                                |
| ---------- | --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| v0.1.0     | ✅ Released     | 7주차               | MVP Must (메인·인사말·갤러리·지도·계좌 복사·카카오 공유·D-day·인앱 배너·OG·Classic)                                      |
| v0.2.0     | ✅ Released     | 9주차 Day 1         | Modern·Floral 테마 + 다중 테마 인프라 + 구글 캘린더 + 방명록 (Firestore + bcrypt + 욕설 필터) + ADR 005·006              |
| **v1.0.0** | 🎯 Week 10 목표 | 6/30 (10주차 말)    | 비개발자 5분 배포 가이드 ✅ (9주차 완료 — 1 주 앞당김) · README 영문 보강 · Lighthouse 90+ · 기기 매트릭스 · 데모 사이트 |
| v1.1+      | ⏳ 후보         | v1.0 후 실수요 보고 | 웹 에디터 · RSVP · 다국어 UI · BGM · Apple Calendar · 본인 삭제 (Cloud Function)                                         |

**v1.0 까지 남은 큼지막한 항목**: README 영문 보강 (5주차 이후 변경 반영), Lighthouse·기기 매트릭스 검증, 데모 사이트 배포. 본 9주차에 가이드 3종이 한 주 앞당겨 끝나서 10주차에 QA·릴리스에 더 시간 배분 가능.

---

## 🚧 10주차로 넘기는 것 (우선 순위)

### v1.0 마감 후보

1. **README 영문 섹션 5주차 이후 동기화** — 5주차에 한·영 동시 현실화 후 6·7·8·9주차 누적 변경 (다중 테마 · 캘린더 · 방명록 · 배포 가이드 3종 · v0.2 릴리스) 반영. 영문은 OSS 첫 진입자 (한국 외 fork 시도) 의 첫 인상이라 v1.0 직전 정비 필수.
2. **Lighthouse 90+ + 기기 매트릭스** — 모바일 Safari · Android Chrome · 인앱 웹뷰 (카카오톡 · Instagram) 4 환경에서 Lighthouse 점수 + 갤러리·방명록·공유·캘린더 시나리오 통과. 이미지·번들 사이즈 최적화 동반.
3. **데모 사이트 배포** — 가상의 커플 (`demo-config.ts` 또는 별도 Vercel 프로젝트) 로 OSS 첫 방문자가 즉시 청첩장 동작을 볼 수 있는 데모. README 데모 링크 + 스크린샷·GIF.
4. **`v1.0.0` 태그 + GitHub Release** — 7주차 `v0.1.0` · 9주차 `v0.2.0` 패턴 미러. CHANGELOG `[1.0.0]` 섹션 (v0.2 → v1.0 누적 정리, 가이드 3종 · README 영문 · Lighthouse 결과). 라이선스 / 저작권 고지 최종 점검.
5. **CONTRIBUTING.md 최종 점검** — Week 11 외부 기여자 환영 준비. 새 테마 PR 흐름 (`theme-guide.md` 5단계 그대로) · 이슈 템플릿 · PR 템플릿 점검.

### 작은 후보 (1줄~30 분)

6. **Vercel 환경변수 등록 누락 사례를 README 에도 한 줄 추가** — 현재는 `firebase.md` + `api-keys.md` 에만 박힘. README 가 OSS 첫 진입점이므로 한 줄 경고 + `api-keys.md` 링크.
7. **메모리 회수**: `project_week09_calendar_verified.md` (본 회고로 회수) → 본 회고 커밋과 함께 삭제. (회고 작성 호흡에서 자동 회수 의도였음.)

### 보류 (사용자 트리거 시)

- **Floral 디자인 재설정** — 8주차 1차 구현 후 인상 부족. 메모리 (`project_floral_theme_redesign_pending.md`) 유지.
- **Modern accent 색 재검토** (`#e2e8f0` 약함) — 실사용자 피드백 트리거 시.

---

## ❌ 아직 스킵 / 영구 후보 외

- 웹 에디터, RSVP, BGM, 다국어 UI, Apple Calendar, 본인 삭제 (Cloud Function 프록시) — 모두 v1.0 이후
- Firestore Emulator 실제 사용 — `firebase.json` 에 포트 정의만, 코드의 `connectFirestoreEmulator` 호출 미도입. 실수요 발생 시
- 욕설 필터 외부 패키지 (korcen 등) — ADR 006 의 재검토 트리거 (50 항목 / 30건 / 100명+) 충족 시
- 프로덕션 검증 자동화 (Playwright 등) — v1.0 이후. 현재는 사용자 자가 검증 + CI lint/typecheck/build 로 충분

---

## 📌 10주차 첫 세션 시작 방법

1. **`git log --oneline -15`** — 9주차 11 커밋 (회고 커밋 포함) + `v0.2.0` 태그 확인.
2. **이 파일 (`docs/retrospective/week-09.md`) 다시 읽기** — 9주차 결과와 10주차 우선 태스크.
3. **`docs/00-roadmap.md`** 확인 — 진행도 9/12 반영됐는지, Week 9 엔트리 결과 채워졌는지, Week 10 가이드와 이 회고의 우선 태스크 일치 확인.
4. **CI 결과 확인 (latest run on main)** — 9주차 마지막 푸시 (회고 커밋) 가 main 에 정상 도착했는지 + CI 녹색 여부.
5. **프로덕션 URL 확인** — `https://invitation-kit.vercel.app` 접속 → 데스크톱 + 모바일 Safari 시뮬레이터로 v0.2 전체 기능 (다중 테마 토글 · 갤러리 · 지도 · 계좌 · 공유 · 캘린더 · 방명록) 한 번 통독. 9주차 환경변수 정상화 후 안정 상태인지 확인.
6. **사용자에게 우선 태스크 제안** — 위 "10주차로 넘기는 것" 1번 (README 영문 동기화) 또는 2번 (Lighthouse + 기기 매트릭스) 중 사용자 선택. 1번이 분량 작고 즉시 시작 가능, 2번이 실기기 + Vercel 데이터 필요해 컨텍스트 더 드는 작업.
7. 사용자 승인 후 Plan Mode 진입 → 구현 → 표준 quality gate (`rm -f .eslintcache && lint && typecheck && format:check && build`) → 커밋 → 푸시 → Monitor 도구 (1순위) 또는 Bash `run_in_background` + `until` 루프 (fallback) 으로 CI 폴링.

### Progressive Disclosure 규칙 파일 — 10주차 작업 시 함께 읽을 것

- `.claude/rules/firebase.md` — 방명록 / RSVP 관련 작업, 환경변수 등록 절차 (9주차 갱신 반영)
- `.claude/rules/kakao-sdk.md` — 공유 / 지도 관련 작업, 도메인 등록 2 필드 표
- `docs/api-keys.md` · `docs/config-guide.md` · `docs/theme-guide.md` (9주차 신규) — README 영문 동기화 시 참조 (이 가이드의 사용자 시점 절차를 README 가 요약 형태로 가리킴)

---

## 📝 CLAUDE.md 갱신 사항

이 회고 커밋에 묶어 동시 갱신.

- "진행 상태 (8주차 Day1~Day3 종료 시점)" 라인 → "9주차 Day1~Day2 종료 시점" 으로 갱신. 추가 항목:
  - `docs/api-keys.md` · `docs/config-guide.md` · `docs/theme-guide.md` (배포 가이드 3종)
  - `v0.2.0` 태그 + GitHub Release Latest 공개
  - `firebase.md` 의 set-state-in-effect 메모 격상 (절대 금지 톤)
  - `firebase.md` 의 환경변수 섹션 + Console 설정 8 단계 + Gotcha 에 Vercel 등록 + 재배포 단계 영구화
  - 표준 quality gate 시퀀스 명시 (라인 94)
- "세부 규칙 위치" 섹션의 placeholder 그대로 유지 — `kakao-sdk.md` · `firebase.md` 만 실체화, `theming.md` · `section-component.md` 는 본 9주차에 만들 필요 없었음 (theme-guide.md 가 같은 역할 수행).

---

## 🗑️ 메모리 정리

본 회고 커밋과 함께:

- **회수 + 삭제**: `project_week09_calendar_verified.md` — 8주차 우선 태스크 3번 닫힘 결과를 본 회고 본문에 박았으므로 메모리 중복 보관 불필요. `MEMORY.md` 인덱스에서도 제거.
- **유지**: `project_floral_theme_redesign_pending.md` — 사용자 트리거 전까지 자동 재진입 금지 의도 그대로.
- **유지**: `feedback_retrospective_format.md` — 본 회고 구조 자체가 이 메모리 ("다음 주차 첫 세션 시작 방법" 섹션 필수) 의 적용 사례.

---

## 🎬 클로징

9주차는 **코드 동결 + 문서·운영 정리** 의 주차. 8주차 누적 12 커밋을 v0.2 로 닫고, 비개발자 5분 배포 가이드 3종으로 v1.0 의 큰 덩어리 1개를 미리 완료. 회고 우선 태스크 6 항목을 모두 닫으면서 5번처럼 가설 자체 정정도 함께 이뤄짐 — 회고가 진짜 살아있는 문서임을 본 호흡에서 실증.

10주차는 v1.0 마감 + 릴리스. 11주차 공개 / 홍보 → 12주차 유지보수 기반의 마지막 두 주를 위해, 10주차에 README 영문 · Lighthouse · 데모 사이트 · `v1.0.0` 태그까지 묶어 닫는 게 이상적인 그림.
