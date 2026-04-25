# Week 10 회고 — v1.0 마감 + 데모 가시화 + 첫 Performance 측정 사이클

**기간:** 2026-04-25 (Day 1 단일 호흡 압축 진행)
**누적 커밋:** 7 건 (본 회고 커밋 제외) + annotated tag `v1.0.0` + GitHub Release Latest
**태그:** `v1.0.0` 신규
**진행도:** 10/12 주 (83%)

---

## 🎯 이번 주차 핵심

9주차 회고의 "10주차로 넘긴" 우선 태스크 **7 항목 모두 closure** + `v1.0.0` 첫 메이저 릴리스. 1번 (README 한·영 동기화) 시작 시점에 발견한 **"한국어 README 도 5주차 이후 변경 0"** 이 본 호흡의 분량을 키운 핵심 발견 — 영문 동기화가 사실상 한·영 양쪽 6·7·8·9주차 누적 동시 갱신으로 확장. v1.0 마감 직전 첫 Lighthouse 측정 사이클에서 Performance 71 → 78 (LCP 15.1s → 5.1s) 달성, 90+ 미달 사실은 Known Limitations + v1.1+ 후보로 정직 기록.

---

## ✅ 9주차 회고 우선 태스크 7 항목 결과

| #   | 항목                                              | 결과                                                                                                                                                    | 처리 커밋                     |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | README 영문 5주차 이후 동기화                     | ✅ 완료 — **한국어도 5주차 이후 변경 0 발견**, 한·영 동시 갱신으로 확장. H2 9개 양쪽 대칭, 라인 수 243/243                                              | `8fc950e`                     |
| 2   | Lighthouse 90+ + 기기 매트릭스                    | ✅ **부분 closure** — 모바일 simulate Performance 71 → 78 (LCP −10s). 90+ 미달 사실 정직 기록, 실 사용자 환경 측정 + firebase lazy import 는 v1.1+ 후보 | `d378bb2` `b1c30fd` `82f30c7` |
| 3   | 데모 사이트 배포                                  | ✅ 완료 — `invitation-kit.vercel.app` 자체가 가상 커플 OSS 데모로 작동 발견. 6 PNG (~7MB) + README 데모 H2 신규                                         | `222234c`                     |
| 4   | `v1.0.0` 태그 + GitHub Release                    | ✅ 완료 — 7주차 v0.1.0 / 9주차 v0.2.0 패턴 미러. CHANGELOG `[1.0.0]` (Performance 표 포함) + Release Latest                                             | `1a83c27` + annotated tag     |
| 5   | `CONTRIBUTING.md` 최종 점검                       | ✅ 완료 — 신규 작성 (한국어 only, 가이드 3종 정책 일관). 환영 4종·환영 안 함 5종·표준 quality gate·새 테마 PR 흐름 5단계·모바일 Safari 의무·라이선스    | `2010211`                     |
| 6   | (작은) Vercel env 등록 사례 README 한 줄          | ✅ **1번 작업에 자연 흡수** — Quick Start 5번 Firebase 단계 신설 + Environment variables 경고 한 줄로 영구화                                            | `8fc950e` 안                  |
| 7   | (작은) 메모리 회수 (`project_week09_calendar...`) | ✅ **9주차 회고 커밋에서 처리됨** — 본 호흡 시점 이미 삭제 상태                                                                                         | (9주차 `859155d`)             |

---

## 📋 실제 결과물 (커밋 7 건)

본 호흡 단일 Day. 시간 흐름 순:

1. **`8fc950e` docs(readme)** — 한·영 README v0.2까지 동기화 + 가이드 3종 링크. 5주차 `22e90ad` 이후 양쪽 README 모두 변경 0 였던 갭 해소. 회고 우선 1번. **분량 +272/-92 줄.** 회고 작은 후보 6번 (Vercel 환경변수 한 줄) 도 본 커밋의 Quick Start 5번 + Environment variables 경고로 흡수.
2. **`222234c` docs(readme)** — 데모 섹션 신규. 한·영 README 의 새 H2 `## 🎬 데모/Demo`, 데스크톱 풀페이지 1 + 모바일 4컷 markdown 표 + 다중 테마 collage 1. `public/images/screenshots/` 디렉토리 신규 6 PNG. 회고 우선 3번.
3. **`d378bb2` perf(gallery)** — Gallery `priority={idx < 3}` 제거. 회고 우선 2번 첫 분리 커밋. **가설 부정확 — LCP 15.1 → 14.7 만, 효과 미미.** 다만 above-the-fold 아닌데 priority 두는 게 의미 없으니 보존.
4. **`b1c30fd` fix(a11y)** — Classic·Floral text-secondary contrast 4.5:1 충족. **audit 가 잡은 게 사실 text-primary 였음 발견** (이 커밋 후). text-secondary 변경은 baseline 개선이라 보존.
5. **`82f30c7` perf(font)** — Pretendard variable 2MB → 3 weight Korean subset 784KB. **회고 우선 2번의 진짜 임팩트** — LCP 14.7 → 5.1s (−9.6s). Performance 72 → 78. `pretendard@1.x` npm install 후 dist cp + uninstall (런타임 의존성 0).
6. **`2010211` docs(contributing)** — CONTRIBUTING.md 신규 + README v1.0 targets 갱신. 회고 우선 5번.
7. **`1a83c27` docs(release)** — `v1.0.0` CHANGELOG 섹션 + package.json 1.0.0 + link ref. 회고 우선 4번 1단계.
8. (커밋 외) **annotated tag `v1.0.0` push + GitHub Release Latest 공개.** 회고 우선 4번 2-3단계.

---

## 🎁 보너스 발견·산출물

### 1. **한국어 README 도 5주차 이후 변경 0 발견** (회고 1번 시작 시점)

회고는 "영문 동기화" 만 명시했지만 실제 탐색 (`git log 22e90ad..HEAD -- README.md`) 에서 **양쪽 모두 변경 0** 확인. 회고가 작성된 9주차 시점에 사용자도 이 사실을 놓침 — "영문이 한국어를 쫓아간다" 는 가정이 부정확했음. 본 호흡에서 한·영 동시 갱신 (5주차 `22e90ad` "한·영 동시 현실화" 패턴 미러) 1 커밋으로 처리하기로 사용자 합의 후 진행. 회고 작성 시점 가정의 한계가 다시 한 번 드러난 사례 — 회고 본문이 원자료 (실 git history) 와 갭이 생길 수 있음.

### 2. **Performance 가설 두 차례 부정확 → 진짜 원인 = Pretendard 2MB**

회고 우선 2번 진행 시 1차 가설 (Gallery priority + text-secondary 색) 두 개 모두 부정확. 진단 audit detail (network-requests, color-contrast 의 실 element) 을 깊이 파고 나서야 진짜 원인 발견:

- LCP 진짜 원인 = `PretendardVariable.woff2` (2,059KB, 페이지 weight 의 80%)
- a11y 진짜 원인 = `text-primary` `#c9a87c` (audit 가 "text-secondary" 라고 보였던 건 다른 라운드 측정)

→ **가설 → 측정 → 가설 정정 → 재측정 사이클이 Performance 작업의 자연 패턴**. 1차 가설이 효과 미미해도 코드 의도 자체 옳음 (above-the-fold 아닌데 priority 두는 게 옳지 않음, secondary 색 contrast 도 baseline 개선) 으로 보존.

### 3. **Lighthouse CLI desktop preset 측정 불안정 finding**

`--preset=desktop` + `--throttling-method=simulate` 환경에서 **LCP/TBT/TTI 가 일관되게 score=null 반환** 두 번 재현. FCP/Speed Index 만 정상값. Lighthouse CLI 한계 — desktop 점수는 [PageSpeed Insights 웹사이트](https://pagespeed.web.dev) 가 정확. v1.0 CHANGELOG Known Limitations 에 박음.

### 4. **Monitor 도구 zsh `$status` 변수 충돌 finding**

`status` 가 zsh 의 read-only 변수 (last command exit code) 라 Monitor script 안 `local status=...` 같은 변수 할당이 `(eval):4: read-only variable: status` 에러로 죽음. **`state` / `result` 변수명 사용으로 회피.** 9주차 회고 우선 5번 fact-check 의 Monitor 거부 케이스와는 다른 별개 셸 충돌. 굳이 회고 본문 격상하지 않고 sub-bullet 한 줄로 박음 (다른 변수명 쓰면 끝나는 단순 문제).

### 5. **Quality gate 1 패스 패턴 lock-in**

8주차 (`b2af838`) · 9주차 (`b934f9b`) 두 차례 prettier `format:check` fix-forward 후, **10주차 7 커밋 모두 1 패스 통과**. format → format:check 두 단계 워크플로 + 표준 quality gate 시퀀스 (`rm -f .eslintcache && lint && typecheck && format:check && build`) 명시 (CLAUDE.md 라인 94, 9주차 `c58b50f`) 의 ROI 실증. 매 커밋 prettier 가 markdown table padding 자동 정렬한다는 인지가 lock-in 효과.

### 6. **Auto mode 의 "결정 vs 옵션 나열" 균형 finding**

호흡 중간 Performance 78점 도달 시점 사용자가 "뭐 어떻게 하라고?" 피드백 → 옵션 너무 많이 나열한 응답이 부담. **Auto mode 에서는 추천 명료 + 즉시 실행 + 사용자가 끊으면 멈추는 톤** 이 자연. 같은 톤 적용한 후속 응답은 깔끔히 진행. 시스템 reminder 의 "Minimize interruptions, prefer action over planning" 의 운영 의미를 본 호흡에서 학습.

---

## 💡 배운 것

### 1. 회고 "넘기는 것" 명세는 시작 시점 가정 — 실 작업에서 확장될 수 있음

9주차 회고의 1번 ("README 영문 동기화") 명세가 사실상 부정확한 가정 위에 있었음 — 한국어 README 가 변경됐다는 전제. 실 탐색에서 **양쪽 모두 변경 0** 발견 후 작업 분량이 자연 확장. **회고 명세의 일부는 시작 시점 가정**이라 실 작업 직전 git history 같은 원자료 검증이 필요.

본 호흡에선 plan mode 의 Phase 1 Explore 단계가 이 갭을 정확히 잡음 (`git log 22e90ad..HEAD -- README.md → 0 commits`). plan mode 의 ROI = "회고 명세의 시작 시점 가정 검증" 도 포함됨.

### 2. Performance 가설은 측정으로만 검증 가능 — 정황 분석은 출발점일 뿐

회고 우선 2번 1차 라운드의 두 가설 (Gallery priority, text-secondary) 이 모두 부정확. 코드만 보고 만든 정황 분석은 **출발점**이지 결정이 아님. 측정 → 가설 부정 → 진단 audit detail 깊이 파기 → 진짜 원인 (Pretendard 2MB) 발견 사이클이 핵심.

미래 Performance 작업 시 패턴: **첫 측정 → audit detail 깊게 (`network-requests`, `largest-contentful-paint-element`, `bootup-time`) → 가장 큰 1 자원 식별 → 그 자원 부터 처리**. 1차 가설부터 만들지 말고 데이터 부터.

다만 1차 가설의 코드 의도 자체가 옳으면 (above-the-fold 아닌데 priority 두지 않음, secondary 4.5:1 보장 baseline) **부수 효과 미미해도 보존** — fix-forward 가 아니라 forward-only 정책.

### 3. Lighthouse CLI 한계 + simulate vs 실 환경 갭은 정직 기록

본 호흡에서 두 한계 발견:

- **Desktop preset 측정 불안정** — LCP/TBT/TTI null. 두 번 재현
- **Mobile simulate Slow 4G 78 점이 실 사용자 환경 (LTE/Wi-Fi) 점수와 다름** — simulate 가 보수적

→ v1.0 release notes 의 Known Limitations 에 정직 기록 + 사용자 영역 (PSI 웹사이트 측정) 으로 보강 안내. **점수 미달 사실을 숨기지 않는 것이 OSS 신뢰 자산** — 인위적으로 90+ 만들기 위해 의미 없는 micro-optimization 또는 measurement gaming 하지 않음.

### 4. Auto mode 운영 — 결정 명료 + 즉시 실행 + 끊을 수 있는 신호

사용자 "뭐 어떻게 하라고?" 피드백 후 학습. Auto mode 에서 옵션 4-5개 나열 + 사용자에게 결정 떠넘기는 톤은 **결단력 부재 신호**. 시스템 reminder 도 "Minimize interruptions, prefer action over planning" 명시.

새 패턴: 추천 1 안 명료히 박고 → 즉시 실행 신호 → 사용자가 다른 의견 있으면 "끊어줘" 한 줄로 멈출 수 있게. 이렇게 하면 사용자 부담 최소화 + Auto mode 본래 의도 (autonomous progress) 일치.

다만 진짜 큰 의사결정 (디자인 결정 D-1/D-2/D-3, 데모 캡처 매트릭스 변형 A/B/C 등) 은 옵션 나열이 적절. 구분점: **결정이 코드/UX/디자인 측면에서 무거운가** vs **기술적 진행 방향인가**. 후자는 추천 즉시 실행, 전자는 옵션 합의.

### 5. Quality gate 1 패스 패턴은 매 호흡 의식의 결과

10주차 7 커밋 연속 1 패스 — 표준 시퀀스 명시 (CLAUDE.md 라인 94) + format → format:check 두 단계 + prettier 가 markdown 자동 정렬한다는 인지 + 큰 markdown 추가 시 미리 format 의식 적용. 본 호흡 마지막 (CHANGELOG `[1.0.0]` 추가) 에서 "format:check 잡힐 듯 → 미리 format 후 검증" 패턴 자연 적용.

8주차 두 차례 + 9주차 두 차례 fix-forward 후 10주차 0 회. **시퀀스 명시 → 의식 → 자동화 lock-in** 의 학습 곡선 확인.

### 6. v1.0 마감의 "정직한 미달" 기록 vs "100% closure" 강박 trade-off

회고 우선 2번이 90+ 미달 (78점) 인데 closure 처리. closure 기준을 어떻게 정의할까:

- **점수 closure**: 90+ 도달이 closure → 본 호흡 미달
- **사이클 closure**: 진단 → 수정 → 재측정 → 효과 확인 → 한계 발견 → 다음 후보 정리 → closure → 본 호흡 통과

본 호흡은 사이클 closure 채택. **v1.0 의 정직성** 우선 — 점수 못 만든 걸 인위적 micro-optimization 으로 끌어올리지 않고, "78 + 사이클 완수 + 90+ 도달은 v1.1+ 별도 호흡" 으로 명시. CHANGELOG Known Limitations 에 정직 기록 + Release Latest 본문에도 명시.

이 trade-off 가 v1.0 의 핵심 결정. 사용자 결정 (D-3 보류 + 78 closure) 으로 명시화.

---

## 🔢 메트릭

- **10주차 커밋 수 (Day 1)**: 7 개 (본 회고 커밋 제외)
  - 4 docs (readme · contributing · release) · 2 perf (gallery · font) · 1 fix(a11y) · 본 release 커밋 1
  - 9주차 (10 커밋 모두 docs) 와 달리 **perf · fix 코드 커밋 3 건 포함** — Lighthouse 사이클이 코드 변경 트리거
- **태그 생성**: 1 (`v1.0.0` annotated)
- **GitHub Release**: 1 (Latest, 한국어 primary + 영문 summary)
- **신규 문서**: 1 (`CONTRIBUTING.md`)
- **갱신 문서**: 5 (CHANGELOG.md `[1.0.0]` · README.md (h2 9→10) · README.en.md (h2 9→10) · package.json · 다음 호흡: roadmap · CLAUDE.md)
- **신규 디렉토리**: 1 (`public/images/screenshots/` 6 PNG)
- **CI 런**: 7 회. **빨간불 0 회** (전 커밋 1 패스 통과 — 8/9주차 fix-forward 패턴 회피 정착)
- **외부 기여자**: 0 명 (CONTRIBUTING.md 본 호흡 ship — 11주차 이후 측정)
- **의존성 추가**: 0 (런타임). pretendard@1.x install/uninstall 사이클로 dist 만 carry over
- **삭제 의존성**: 0
- **신규 lib 모듈**: 0 (8주차 4 개 그대로)
- **회고 우선 태스크 closure 비율**: 7/7 (100%)
- **Performance Lighthouse 모바일 simulate**: 71 → 78 (+7), LCP 15.1s → 5.1s (-10.0s)
- **폰트 분량 절감**: 2,059 KB → 784 KB (~62% 절감)
- **README 분량**: 한국어 189 → 264 줄 / 영문 127 → 264 줄 (양쪽 동등)

---

## 🚀 v1.0 → v1.1+ 마일스톤 진척도

| 버전       | 상태            | 시기                | 주요 항목                                                                                                                              |
| ---------- | --------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1.0     | ✅ Released     | 7주차               | MVP Must                                                                                                                               |
| v0.2.0     | ✅ Released     | 9주차               | Modern·Floral 테마 + 캘린더 + 방명록                                                                                                   |
| **v1.0.0** | ✅ **Released** | **10주차 Day 1**    | **데모 가시화 · CONTRIBUTING · 한·영 README 동기화 · Performance 78 · a11y secondary**                                                 |
| v1.1+      | ⏳ 후보         | v1.0 후 실수요 보고 | 웹 에디터 · RSVP · BGM · i18n · Apple Calendar · 본인 삭제 (Cloud Function) · firebase lazy · Pretendard dynamic-subset · App Check 등 |

**v1.0 closure 의의**: MVP (v0.1) → 다중 테마 + 방명록 (v0.2) → 데모 가시화 + 외부 기여 준비 + 첫 측정 사이클 (v1.0). OSS 첫 진입자 (한국 + 외국) 가 fork 후 5분 배포 + 본인 결혼식 사용까지 가는 흐름 완성. 11주차 공개·홍보 호흡 직전.

---

## 🚧 11주차로 넘기는 것 (우선 순위)

### 11주차 본격 항목 (회고 9주차 + 로드맵 Week 11 기준)

1. **velog/브런치 개발 회고 포스트** — 12 주 호흡 전체 정리 (1주차 기획 → v1.0 release). 코드 OSS 자산 외 별도 글 자산
2. **X/Twitter 쓰레드** — 개발 과정 스토리텔링 (한국어 + 영문 시도). 다중 테마 collage·데모 SS 자산 활용
3. **OKKY · 개발자 Discord · 페이스북 그룹 공유** — 한국어 OSS 커뮤니티 확산
4. **Hacker News "Show HN" 제출** — 영문. README.en.md + Live demo 링크 + Performance 자료
5. **Awesome Korean 개발자 리스트 PR** — 한국 OSS 디렉토리 등재
6. **첫 외부 Contributor 환영** — 이슈/PR 수신 시 24h 이내 응답 루틴 정착. CONTRIBUTING.md ship 후 첫 트래픽 측정

### 사용자 영역 (병렬, 11주차 데이터 합치기)

- **데스크톱 PageSpeed Insights** ([pagespeed.web.dev](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Finvitation-kit.vercel.app)) — 데스크톱 4 점수 측정. Lighthouse CLI 데스크톱 preset 한계 보완. 11주차 회고 보강 자료
- **실기기 매트릭스** — iPhone Safari · Galaxy Chrome · 카톡 인앱 · Instagram 인앱 4 환경. 핵심 시나리오 (홈·갤러리·방명록·공유) 통독. 발견 이슈 → 별도 호흡

### v1.0 후속 후보 (작은 → 큰)

7. **Vercel deploy 의 PNG 사이즈 최적화 가능성 점검** — `desktop-home.png` (3MB) · `mobile-gallery-lightbox.png` (2.4MB). pngquant/zopflipng 30~50% 절감. 별도 1 호흡
8. **GIF 데모 추가** — 갤러리 swipe 인터랙션 (정적 SS 못 잡음). 셀링 보강
9. **firebase · bcryptjs lazy import (Performance 90+ 시도)** — Guestbook dynamic mount. SSR boundary 검증. 1~2 호흡
10. **Pretendard dynamic-subset 검토** — unicode-range 분할 fetch (~200~400KB 만 실 fetch). git 사이즈 + next/font 우회 trade-off 평가
11. **text-primary contrast 결정** — D-3 보류 → 디자인·a11y 중 한 방향 결정. Floral 디자인 재설정과 묶어 한 호흡

### 보류 (사용자 트리거 시)

- **Floral 디자인 재설정** — 8주차 1차 구현 후 인상 부족, 메모리 (`project_floral_theme_redesign_pending.md`) 유지
- **Modern accent 색 재검토** (`#e2e8f0` 약함) — 실사용자 피드백 트리거 시
- **text-primary 색 결정** — Classic warm beige 셀링 vs WCAG AA 트레이드오프

---

## ❌ 아직 스킵 / 영구 후보 외

- 웹 에디터 UI · RSVP · BGM · i18n · Apple Calendar · 방명록 본인 삭제 (Cloud Function) — 모두 v1.1+ 후보
- Firestore Emulator 실 사용 — 8주차 firebase.json 포트만 정의, 코드 호출 미도입. 실수요 발생 시
- 욕설 필터 외부 패키지 (korcen 등) — ADR 006 의 재검토 트리거 (50 항목 / 30건 / 100명+) 충족 시
- 프로덕션 검증 자동화 (Playwright 등) — v1.1+ 후보. 현재는 사용자 자가 검증 + CI lint/typecheck/format:check/build 로 충분
- Performance simulate 90+ 도달 — 위 v1.0 후속 9번 (firebase lazy) 으로 시도, 실 사용자 환경에선 이미 도달했을 가능성

---

## 📌 11주차 첫 세션 시작 방법

1. **`git log --oneline -15`** — 10주차 8 커밋 (회고 커밋 포함) + `v1.0.0` 태그 확인.
2. **이 파일 (`docs/retrospective/week-10.md`) 다시 읽기** — 10주차 결과와 11주차 우선 항목.
3. **`docs/00-roadmap.md`** 확인 — 진행도 10/12 반영됐는지, Week 10 결과 채워졌는지, Week 11 가이드와 본 회고 일치 확인.
4. **CI + Vercel 상태 확인** — 10주차 마지막 푸시 (회고 커밋) main 정상 도착 + Vercel deploy 새 폰트 subset · 새 a11y 색 반영 여부.
5. **프로덕션 통독 (간단)** — 데모 사이트 visual 한 번 — 새 secondary 색·폰트 차이 visual 만족 여부.
6. **사용자에게 우선 항목 제안** — 위 "11주차로 넘기는 것" 1~6번 (홍보 5건 + 외부 기여자 환영). 1번 (velog/브런치 개발 회고 포스트) 이 분량 가장 큼 + 12 주 전체 호흡 회고라 첫 호흡 적정. 또는 2번 (X 쓰레드) 가 짧은 호흡으로 워밍업.
7. 사용자 승인 후 Plan Mode 진입 → 구현 → 표준 quality gate (`rm -f .eslintcache && lint && typecheck && format:check && build`) → 커밋 → 푸시 → Monitor 도구 (1순위, **변수명 `state` 사용 — `$status` 는 zsh read-only 충돌**) 또는 Bash `run_in_background` + `until` 루프 (fallback) 으로 CI 폴링.

### Progressive Disclosure 규칙 파일 — 11주차 작업 시 함께 읽을 것

- `.claude/rules/firebase.md` — 방명록 / RSVP 트래픽 모니터링 시점, 환경변수 등록 절차
- `.claude/rules/kakao-sdk.md` — 공유 카드 활용 (X/페북 공유 vs 카톡 공유 비교 등)
- `docs/api-keys.md` · `docs/config-guide.md` · `docs/theme-guide.md` (9주차) — 외부 기여자 PR 수신 시 가이드 reference
- `CONTRIBUTING.md` (10주차) — PR/이슈 응답 시 톤 일관

---

## 📝 CLAUDE.md 갱신 사항

이 회고 커밋에 묶어 동시 갱신.

- "진행 상태 (9주차 Day1~Day2 종료 시점)" 라인 → "10주차 Day 1 종료 시점" 으로 갱신. 추가 항목:
  - `CONTRIBUTING.md` 신규
  - `public/images/screenshots/` 디렉토리 (6 PNG 데모)
  - `app/fonts/Pretendard-{Light,Regular,Medium}.subset.woff2` (variable 2MB 삭제, subset 3 weight 784KB)
  - `v1.0.0` 태그 + GitHub Release Latest
  - 한·영 README H2 9 → 10 (Demo H2 추가) · 양쪽 264 줄
  - Lighthouse 모바일 simulate Performance 78점 + LCP 5.1s 달성
  - Classic·Floral `--color-secondary` contrast 조정 (4.5:1 충족)
- "세부 규칙 위치" 섹션 placeholder 그대로 유지 — 본 호흡에서 신규 규칙 파일 작성 안 함 (`theming.md` · `section-component.md` 모두 `theme-guide.md` + `CONTRIBUTING.md` 가 같은 역할 수행).

---

## 🗑️ 메모리 정리

본 회고 커밋과 함께:

- **유지**: `feedback_retrospective_format.md` — 본 회고 구조 자체가 이 메모리 ("다음 주차 첫 세션 시작 방법" 섹션 필수) 의 적용 사례. 10주차 회고도 그대로 적용.
- **유지**: `project_floral_theme_redesign_pending.md` — 사용자 트리거 전까지 자동 재진입 금지 의도 그대로. 11주차에 트리거 가능성 있어 유지.
- **신규 후보 (저장 안 함)**: Monitor `$status` zsh 충돌 finding · Quality gate 1 패스 패턴 lock-in · Performance 가설은 측정으로만 검증 — 모두 본 회고 본문에 박혔고 일반 학습이라 메모리 격상 불필요.

---

## 🎬 클로징

10주차는 **v1.0 마감 + 데모 가시화 + 첫 측정 사이클** 의 주차. 회고 우선 7 항목 100% closure. 9주차의 "코드 동결 + 문서 정리" 흐름과 달리 본 호흡은 **perf · fix 코드 커밋 3 건** 포함 — Lighthouse 사이클이 코드 변경 트리거.

핵심 발견: **회고 명세의 시작 시점 가정 검증 필수** (1번 작업의 한국어 README 갭 발견), **Performance 가설은 측정으로만 검증** (1차 가설 두 개 부정확 → 진짜 원인 = Pretendard 2MB), **Auto mode 의 결단력 균형** (옵션 나열 vs 즉시 실행).

11주차는 공개·홍보 호흡. v1.0 자산 (Live demo + Performance 정직 기록 + CONTRIBUTING.md + 가이드 3종 + 한·영 README) 을 외부 커뮤니티 (velog · X · OKKY · HN · Awesome Korean) 에 노출. 12주차 유지보수 기반 다지기 직전 마지막 외부 push 호흡.
