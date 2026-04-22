# 디자인 결정 · 1주차 Day 5 산출물

> 이 문서는 v0.1.0(MVP) 구현 이전에 합의해야 할 **디자인 결정 사항**을 모아둡니다.
> Figma 와이어프레임 대신 **텍스트 사양서**로 대체합니다 — config-driven 템플릿이라 레이아웃이 섹션 단위로 정형화돼 있기 때문.

- 상태: **Accepted** (v0.1.0 Classic 프리셋 단일 적용)
- 날짜: 2026-04-23
- 관련: `docs/01-project-brief.md`, `CLAUDE.md`

**v0.1.0 선택 요약**
- 프리셋: **Classic** (팔레트 A · Warm Beige + 폰트 P1 · Cormorant Garamond)
- 구현 범위: 프리셋 1종만. 다중 테마 전환 / 팔레트·폰트 개별 오버라이드는 **v1.0.0(10주차) 과제로 이월**

---

## 1. 섹션 순서와 대략 높이

v0.1.0(Must)과 v1.0.0(Should)을 합친 전체 흐름. 모바일 뷰포트(375×812 기준) 우선.

| # | 섹션 | 목적 | 대략 높이 | 포함 버전 |
|---|---|---|---|---|
| 1 | **Main (Hero)** | 신랑/신부 이름, 예식일, 예식장, 타이틀 비주얼 | `100dvh` | v0.1.0 |
| 2 | **D-day** *(옵션)* | 오늘 기준 남은 일수 카운트 | `~25vh` 카드 | v1.0.0 |
| 3 | **Greeting (인사말)** | 양가 부모 소개 + 인사말 본문 | 내용 기반 (`~60–80vh`) | v0.1.0 |
| 4 | **Gallery (갤러리)** | 사진 그리드 + lightbox | 내용 기반 (grid) | v0.1.0 |
| 5 | **Ceremony Info (예식 정보)** | 날짜·시간·예식장 카드 | `~50vh` | v0.1.0 |
| 6 | **Venue / Map (오시는 길)** | 지도 미리보기 이미지 + 카카오/네이버/구글 버튼 + 주소 복사 | `~60–70vh` | v0.1.0 |
| 7 | **Calendar (캘린더 추가)** *(옵션)* | 구글 캘린더 일정 추가 버튼 | `~15vh` | v1.0.0 |
| 8 | **Guestbook (방명록)** | Firestore 기반 방명록 입력/목록 | 내용 기반 | v1.0.0 |
| 9 | **Account (계좌)** | 양가 계좌 아코디언, 탭 시 복사 + 토스트 | 펼침 상태에 따라 `~40–80vh` | v0.1.0 |
| 10 | **Share (공유)** | 카카오톡 공유 버튼 + URL 복사 | `~25vh` | v0.1.0 |

**레이아웃 규칙:**
- 모든 `vh`는 iOS Safari 대응을 위해 **`dvh`** 사용 (CLAUDE.md 핵심 원칙 4)
- 섹션 간 여백은 공통 토큰(`--section-gap`)으로 관리
- 내비게이션 바는 MVP에서는 **없음** (단일 스크롤 페이지)

---

## 2. 컬러 팔레트 후보 — `modern` 테마용 3종

사용자가 **한 개를 골라 확정**합니다. 확정된 팔레트는 `components/theme/modern.ts`에 토큰으로 이식됩니다.

### A · Warm Beige (따뜻한 클래식)

| 역할 | Hex | 설명 |
|---|---|---|
| Primary | `#C9A87C` | 워시드 샌드. 주요 버튼·강조 |
| Secondary | `#8B7355` | 머티드 브라운. 보조 텍스트·아이콘 |
| Background | `#FAF6EE` | 크림. 전체 배경 |
| Text | `#3D342C` | 다크 브라운. 본문 |
| Accent | `#E8DFD0` | 라이트 베이지. 카드 배경 |

**분위기:** 종이 청첩장 느낌. 양가 어르신도 편안하게 보는 톤.

### B · Cool Mono (모던 미니멀)

| 역할 | Hex | 설명 |
|---|---|---|
| Primary | `#2C2C2C` | 차콜. 헤딩·주요 버튼 |
| Secondary | `#7D7D7D` | 미드 그레이. 보조 |
| Background | `#F7F7F5` | 오프-화이트 |
| Text | `#1A1A1A` | 블랙 |
| Accent | `#D4AF37` | 골드 스팟 (옵션, 아주 작은 영역에만) |

**분위기:** 서울 강남권 모던 웨딩홀 느낌. 사진이 돋보임.

### C · Sage Floral (쿨한 내추럴)

| 역할 | Hex | 설명 |
|---|---|---|
| Primary | `#8A9A7B` | 세이지 그린 |
| Secondary | `#C8A27C` | 테라코타 (포인트) |
| Background | `#F4F1EA` | 웜 오프-화이트 |
| Text | `#3A3528` | 딥 올리브 |
| Accent | `#DCDAC9` | 뉴트럴 샌드 |

**분위기:** 가든/하우스 웨딩, 내추럴 하우스 스타일.

> 최종 선택 후 **[Coolors.co](https://coolors.co)** 에 저장해 링크를 이 문서 아래 "레퍼런스"에 추가합니다.

---

## 3. 폰트 조합 후보 2~3종

한글은 **Pretendard** 거의 확정 (무료·상업 이용 허가, 가변 폰트, 가독성 좋음).
영문·숫자·장식 용도는 아래에서 선택.

### P1 · Pretendard + Cormorant Garamond

- 본문·UI: **Pretendard Variable**
- 숫자·이니셜·타이틀: **Cormorant Garamond** (SIL OFL)
- 분위기: 클래식-모던 믹스. "❤️ 2026. 06. 15" 같은 날짜 장식에 좋음.

### P2 · Pretendard + Italiana

- 본문·UI: **Pretendard Variable**
- 타이틀·이니셜: **Italiana** (SIL OFL, 얇은 세리프 디스플레이)
- 분위기: 미니멀 럭셔리. **Cool Mono 팔레트와 궁합 최고**.

### P3 · Pretendard + Tenor Sans

- 본문·UI: **Pretendard Variable**
- 타이틀: **Tenor Sans** (SIL OFL, 얇은 지오메트릭 산세리프)
- 분위기: 올 산세리프. 가장 모던, 젊은 톤. **Sage 팔레트와 궁합 좋음**.

**참고:**
- 모든 후보는 Google Fonts 또는 `pretendard` npm 패키지로 로드 가능. **외부 CDN보다 self-host** 권장 (모바일 LCP 개선).
- 명조체 2개를 섞는 구성(P1)은 가장 결혼식스럽지만 렌더링 비용이 조금 더 큼.

---

## 4. 팔레트 × 폰트 조합 추천

| 조합 | 팔레트 | 폰트 | 타깃 사용자 | v0.1.0 |
|---|---|---|---|:---:|
| **Classic** | A (Warm Beige) | P1 (Cormorant) | 양가 연장자 포함, 전통적 느낌 선호 | ✅ 선택 |
| **Editorial** | B (Cool Mono) | P2 (Italiana) | 강남권 모던 웨딩, 흑백 사진 중심 | — |
| **Natural** | C (Sage) | P3 (Tenor Sans) | 가든/하우스 웨딩, 젊은 게스트 | — |

**v0.1.0에서는 Classic 단일 프리셋**만 완성합니다.
Editorial · Natural 및 팔레트/폰트 개별 오버라이드 기능은 **v1.0.0(다중 테마)** 으로 이월.

---

## 5. 레퍼런스 (사용자가 채울 자리)

Pinterest 보드 / 스크린샷 / 실제 청첩장 링크 등을 모아두세요. Day 2 레퍼런스 수집 결과를 여기 기록하면, 이후 컴포넌트 구현 시 시각적 기준이 됩니다.

- Pinterest 보드: `TBD`
- 상용 서비스 참고 캡처:
  - 청첩장청첩장: `TBD`
  - 바른손: `TBD`
  - 더카드: `TBD`
- 해외 OSS 데모:
  - `wzulfikar/nextjs-wedding-invite`: https://github.com/wzulfikar/nextjs-wedding-invite
  - `immutable.wedding`: https://immutable.wedding

---

## 6. 결정 기록

### 확정 (2026-04-23)

- [x] 팔레트: **A · Warm Beige**
- [x] 폰트: **P1 · Pretendard + Cormorant Garamond**
- [x] 조합: 추천 프리셋 **Classic** 그대로 적용 (교차 조합 없음)
- [x] v0.1.0 범위: **프리셋 1종만** 완성. 다중 테마 / 팔레트·폰트 오버라이드는 v1.0.0 과제로 이월

### 후속 작업

- [ ] Pinterest 보드 URL (사용자가 생성 후 레퍼런스 섹션에 추가)
- [ ] 2주차 Next.js 초기화 시 `components/theme/modern.ts`(또는 `classic.ts`)에 토큰으로 이식
- [ ] v1.0.0 착수 전 "다중 테마 + 오버라이드" 별도 ADR 작성 예정
