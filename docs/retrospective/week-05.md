# 5주차 회고 (2026-04-24)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 5주차 결과와 6주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### 태스크 1 · Vercel 계정 생성 + 첫 배포 (사용자 브라우저 작업)

- GitHub OAuth 로 Vercel 가입 (Hobby 무료 플랜). 이메일 별도 인증 없이 GitHub 신뢰 기반.
- Vercel GitHub App 설치 (Only select repositories → `kyongskim/invitation-kit` 단일 허용).
- Import → Configure → Deploy. 기본값(Framework auto-detect: Next.js, Node 22.x 기본) 그대로.
- 발급 URL: **`https://invitation-kit.vercel.app`** (선점 경쟁 없어 깔끔한 기본 도메인 확보).
- 첫 빌드 1~2 분, 이후 main push 에 자동 재배포 붙음. `HTTP 200` 응답·타이틀 정상 렌더 확인.

### 태스크 2 · 카카오 공유 end-to-end 검증 + 2 이슈 해결

**config 치환** (`0c3717a`, `ef4bf68`):

- `meta.siteUrl`: `"https://example.vercel.app"` → `"https://invitation-kit.vercel.app"`
- `share.thumbnailUrl` 호스트도 동일하게 교체 (경로 `/images/og.jpg` 는 유지 — OG 이미지 파일은 태스크 5 스코프).
- `80737ff` (로드맵 문서) 는 Prettier 포맷 미통과라 `ef4bf68` 로 별도 포맷 커밋 분리 (amend 회피, CLAUDE.md "NEW commit rather than amending" 원칙).

**카카오 콘솔 UI 재발견**:

- 4주차 `kakao-sdk.md` 가 가정한 경로 `개발자 콘솔 > 애플리케이션 > 플랫폼 > Web > 사이트 도메인` 은 **현재 새 UI 에 존재하지 않음** — 사용자가 "플랫폼 메뉴 없어" 알림. 공식 docs WebFetch 로 새 경로 탐색.
- 새 UI 는 **도메인을 2개 다른 필드로 분리**:
  - `[앱] > 플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인` — `Kakao.init()` 호출 허용 (origin 레벨)
  - `[앱] > 제품 링크 관리 > 웹 도메인` — `content.link.webUrl` / `buttons[].link.webUrl` 호스트 검증
- 첫 시도에 **JavaScript SDK 도메인만 등록** → `initKakao` 성공·`sendDefault` 에러 없이 카드 전송되지만 카드 안 링크가 strip → PC 카톡 "모바일에서 확인해주세요", iPhone "탭 무반응 + 공유하기 버튼만" 증상. 번들 진단 (실제 JS 키 `Kakao.init("a12fe...")` 로 정상 치환 확인, siteUrl 도 `invitation-kit.vercel.app` 번들 반영) 으로 빌드·env 문제 배제 후 카카오 정책 측면으로 범위 좁힘.
- 웹 도메인 필드에 `https://invitation-kit.vercel.app` 추가 후 새 공유 → 카드 링크 정상 동작. PC 카톡 + iPhone 카톡 양쪽 검증.

**buttons[].link 검증 재현** (`20b215e`):

- 링크 정상화 후에도 "지도 보기" 버튼이 청첩장 홈으로 이동 — 지도 버튼 URL 호스트 `map.kakao.com` 이 웹 도메인에 없어 카카오 default (= `invitation-kit.vercel.app`) 로 strip 된 결과. 4주차 회고의 `link.webUrl` 강제 치환 정책이 **`content.link` 뿐 아니라 `buttons[].link` 에도 동일 적용**된다는 사실을 실기기에서 처음 재현.
- 웹 도메인에 `https://map.kakao.com` 추가 → 지도 버튼 즉시 정상. **카카오 자사 도메인이라도 "다른 앱 관점에선 외부 도메인"** 이라는 원리 체감.
- `.claude/rules/kakao-sdk.md` 에 두 발견(새 UI 2 필드 분리 + buttons[].link 검증) 을 표·하위 섹션·운영 규칙으로 영구 박음. "이 규칙 파일을 갱신해야 하는 순간" 리스트에 **"카카오 콘솔 UI 개편"** 트리거 한 줄 추가.

### 태스크 3 · 네이버 지도 형제 함수 + Venue 두 번째 버튼 (`c3463c2`)

- `lib/map.ts` 에 `naverMapDeeplink` 추가. 시그니처는 `kakaoMapDeeplink` 와 동일 (`{name, coords}`) — 호출부 일관성.
- URL 패턴: `https://map.naver.com/v5/search/{encodeURIComponent(name)}?c={lng},{lat},16,0,0,0,dh`. search 경로가 이름 기반 DB 검색 + viewport `c=` 로 좌표 중심 지정 (동명 장소 다수일 때 정확한 지점 우선).
- `nmap://` 커스텀 스킴은 4주차 카카오맵 결정과 동일 원칙 (앱 미설치 UX 회피) 으로 배제.
- Venue 섹션에 "카카오맵으로 보기" 밑에 "네이버 지도로 보기" 버튼 추가 (`flex flex-col gap-3` 세로 스택, 기존 버튼 스타일 재사용). 이 버튼들은 청첩장 페이지 위의 일반 `<a>` 링크라 카카오 콘솔 웹 도메인 등록 대상 아님 (share 카드 안 버튼이 아님).
- 사용자 관찰: 플레이스홀더 "더채플 광화문" 은 Naver DB 에 없어 검색 실패 → 지도만 좌표 중심 표시. Kakao `link/to/{name},{lat},{lng}` 와 Naver `v5/search/{name}` 의 근본 의미 차이 (좌표에 핀 고정 + 라벨 vs name 기반 검색 + 좌표는 viewport) 가 OSS 플레이스홀더 상황에서 드러남. 실사용시 진짜 장소명이면 무문제. 사용자 판단 → **그대로 유지** (옵션 A).

### 태스크 4 · GitHub Actions Node 24 업그레이드 (`0864e02`)

- 매 CI 런 마다 `##[warning]Node.js 20 actions are deprecated... forced to Node.js 24 starting June 2nd, 2026` 어노테이션 누적.
- 대응 선택지 2개 중 액션 버전 범프로 결정:
  - (A) `actions/checkout@v4` → `@v6`, `actions/setup-node@v4` → `@v6` — 두 액션 모두 `action.yml` 의 `runs.using: node24` 확정
  - (B) `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env 주입 — 환경변수로 임시 우회
- (A) 가 영구 해법이고 v4 → v6 breaking 접촉면 없음 (우리 워크플로 = checkout + setup-node + npm cache 단순). `node-version: "22"` 입력은 그대로 — 이건 러너에서 우리 npm 스크립트 실행 Node 버전이라 액션 런타임과 별개.
- 범프 후 CI 런: deprecation 언급 0 건 확인.

### 태스크 6 · README 현실화 (`22e90ad`)

1주차 (2026-04-22) 초기 README 는 "앞으로 이렇게 할 거야" aspirational draft 였는데 4주차 말 실제 구현 범위와 격차가 누적:

- **거짓**: "다중 테마 5종", "사진 갤러리 lightbox", "계좌번호 원클릭 복사", "네이버/카카오/구글 지도 버튼" — 대부분 미구현.
- **과장된 env**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, `NEXT_PUBLIC_SITE_URL`, Firebase 키들 나열. 실제 쓰이는 키는 `NEXT_PUBLIC_KAKAO_APP_KEY` 하나.
- **Dead link 4건**: `docs/config-guide.md`, `docs/api-keys.md`, `docs/theme-guide.md`, `CONTRIBUTING.md` 전부 미존재.
- **프로젝트 구조**도 가상 — `theme/`, `shared/`, `firebase.ts`, `clipboard.ts` 등 미존재.
- **배포 안내**: "Vercel Import 만 하면 끝" 한 줄 — 이번 세션에서 실전은 4 단계 (Vercel import → config URL 교체 → 카카오 콘솔 2 필드 등록 → Vercel env + 재배포) 임이 드러남.

변경 요지:

- Demo 링크 활성화, Why 불렛에서 미구현 항목 제거
- Quick Start 를 실전 4 단계로 확장 (map.kakao.com 웹 도메인 추가 팁 + "dev 환경 검증 불가" 경고 박스 포함)
- Features 를 **현재 구현 / v1.0 목표 / v1.1+ 로드맵** 으로 정직하게 분리
- 환경변수를 `NEXT_PUBLIC_KAKAO_APP_KEY` 하나로 축소
- 프로젝트 구조를 실제 디렉토리로 교체 (미존재 경로는 "v1.0 로드맵" 으로 분리)
- Dead link 전부 제거 (CONTRIBUTING 은 v1.0 릴리스에 맞춰 추가 예고)

README.en.md 도 같은 구조·범위로 반영 (영어 버전은 프로젝트 구조·영감 섹션 생략한 더 간결한 편성 유지).

### 보너스 · 12주 로드맵 문서 (`80737ff`)

- `docs/00-roadmap.md` 신규. "살아있는 문서" 전제로 지난 주차는 실제 한 것, 남은 주차는 계획으로 편성.
- 1-4주차 "실제 결과물" 을 각 회고 + git log 기준으로 기록 (커밋 SHA 앞 7 자리 + 제목 형식). "배운 것" · "예상과 달랐던 점" 은 회고 요약.
- 현재 진행도 4/12 (33%) · v1.0.0 목표 2026-06-30 (10 주차 말) 명시.
- 미래 주차(5~12) 는 현재 시점 추정 계획이라 언제든 재조정 가능함을 문서 서두에 명시.

---

## 막혔던 것 / 고민한 것

### 1. 카카오 콘솔 UI 개편으로 기존 규칙 경로 무효 (태스크 2)

`kakao-sdk.md` 가 구 UI 의 "플랫폼 > Web > 사이트 도메인" 경로 기준으로 써 있는데 사용자 화면에는 해당 메뉴가 없음. 처음엔 "플랫폼" 메뉴를 찾아 헤매다 사용자의 "플랫폼이라는 메뉴는 없어" 알림으로 명확해짐. 공식 docs WebFetch 로 새 UI 의 경로를 찾는 단계에서 docs URL 경로도 여러 번 실패 (`kakaotalk-sharing` 아니라 `kakaotalk-share` 단수형) — 최종적으로 `/docs/ko/javascript/getting-started` 에서 "플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인" 경로 확보, `/docs/ko/kakaotalk-share/js-link` 에서 "제품 링크 관리 > 웹 도메인" 경로 확보.

- **교훈**: 외부 서비스 콘솔 UI 는 메이저 개편이 주기적 — 규칙 파일은 "필드 이름·경로" 기준으로 쓰면 수명이 짧지만, 그렇다고 경로를 안 쓰면 사용자 입장에서 구체 행동이 막연. 절충: 필드 이름을 정확히 쓰되 **"이 규칙 파일을 갱신해야 하는 순간" 트리거 리스트에 "콘솔 UI 개편"** 을 박아 두고, 사용자가 "메뉴 없다" 알리면 즉시 docs 재확인으로 갱신 루틴. 이번에 5주차 회고 커밋 직전까지 이 리듬을 실전으로 검증.

### 2. sendDefault 가 성공인데 카드 링크가 작동 안 함 (태스크 2)

"카카오톡으로 공유하기" 버튼 → 카카오 웹 공유 UI 열림 → 프로필 선택 전송 → 카톡에 카드 도착, **그런데 카드 탭하면 이동 X, 아이콘만 있음**. PC 카톡은 "모바일에서 확인해주세요". 증상만으로는 두 가설:

- (A) 폴백 경로 (`isKakaoShareReady()` false → URL 복사 → 사용자가 직접 붙여넣은 메시지) — OG 태그 없어 카드 미생성, URL 링크만 노출 가능
- (B) sendDefault 는 성공했지만 카카오가 카드 안 링크를 strip

사용자에게 3 질문 (토스트 떴는지·데스크톱 팝업 뜨는지·iPhone 카톡 앱 열리는지) 해서 (B) 로 좁힘. 이후 번들 청크 grep 으로 `Kakao.init("a12fe5118e1e3dfdbd212abb58203a7b")` 확인해 env·빌드 문제 배제 → 카카오 정책으로 범위 축소 → 새 UI 에 "웹 도메인" 필드가 별도 존재한다는 docs 확인 → 해결.

- **교훈**: 카카오 SDK 관련 증상은 **"호출 성공 · 카드 도착" 까지 통과해도 "카드 내부 링크가 살아있는지" 는 별개 검증 포인트**. 이걸 통과한 뒤에야 end-to-end 성공. 체크리스트화: ① SDK 로드 ② init 성공 ③ sendDefault 호출 성공 ④ 카드 수신 ⑤ **카드 본문 탭 이동 확인** ⑥ **각 버튼 탭 이동 확인**.
- **교훈 2**: 진단 시 "폴백 경로 vs 정상 경로" 를 구분하는 가장 빠른 질문 3 개 (토스트 · 팝업 · 앱 열림 여부) 가 굳이 Network 탭 열어볼 필요 없이 사용자 증언만으로 구분 가능. 앞으로 유사 증상 재발 시 같은 질문 루틴 재사용.

### 3. buttons[].link 도 검증 대상이라는 사실 뒤늦게 재현 (태스크 2)

링크 정상화 후 "지도 보기" 버튼이 여전히 청첩장 홈으로 이동. 4주차 `kakao-sdk.md` 가 `link.webUrl` 강제 치환을 이미 문서화하긴 했는데, 당시는 `content.link` 기준 설명이었고 `buttons[].link` 도 동일 검증 대상이라는 점은 명시하지 않음. `map.kakao.com` 이 strip 되어 default 로 치환되는 순간 실기기로 이 빈 구멍이 드러남.

- **해결**: 웹 도메인에 `https://map.kakao.com` 추가 → 즉시 정상.
- **교훈**: 규칙 파일은 **"다음 실기기 검증 기회" 까지는 전제 있는 가설**이라는 겸손한 태도가 필요. 4주차는 dev 환경 검증이 본질적으로 무효라 이 점이 검증되지 않은 채 규칙이 쓰여짐. 5주차 프로덕션 실기기 검증에서 한 층 더 정확도 올라감. kakao-sdk.md 에 `### buttons[].link.webUrl 의 외부 서비스 도메인도 각각 등록 필요` 하위 섹션으로 영구 박음.
- **v0.2+ 대안 메모**: 우리 도메인 위 `/map?to=...` redirect route (Next.js Route Handler 302) 를 두면 버튼 URL 호스트를 우리 도메인으로 고정 → 외부 서비스 도메인 등록 의존 제거 가능. 지금은 등록 한 줄로 해결되어 MVP 스코프에선 채택 안 함, 다만 OSS 사용자가 복수 외부 서비스 버튼을 원하는 시나리오에서 재검토.

### 4. 네이버 지도 URL 이 placeholder 에서 "비어 보이는" 현상 (태스크 3)

플레이스홀더 venue `"더채플 광화문"` 은 가상의 이름인데, 카카오맵은 좌표에 핀 고정하면서 name 을 라벨로 씀 (`link/to/{name},{lat},{lng}` 의미론) 이라 정확히 표시. 네이버 지도는 `v5/search/{name}` 이라 DB 에 없는 이름은 검색 결과 0 건 → 지도만 좌표 중심. 사용자가 "정확한 장소가 안 뜬다" 관찰.

- **근본 원인**: OSS 템플릿의 기본 placeholder 가 가상 값이라는 설계 자체. 실사용 시엔 진짜 홀 이름이 들어가므로 Naver DB 매칭 성공.
- **대안 검토**: (A) 그대로 두기 / (B) config 를 실제 결혼식장으로 교체 / (C) 다른 URL 패턴. (B) 는 "여기서 진짜 결혼하나?" 오해 + 해당 업체에 예의상 부담. (C) 는 placeId 기반 entry/place URL 이 정확도 좋지만 config 에 placeId 필드 추가 필요 — 수동 조사 부담. **사용자 선택: (A) 그대로**. README 나 OG 이미지 작업 때 "플레이스홀더 교체 안내" 한 줄만 추가.
- **교훈**: placeholder 값의 "성격" 이 드러나는 지점은 외부 서비스 연동 각각마다 다름. OSS 템플릿은 이런 "placeholder 특이 증상" 이 사용자 혼란을 만들 수 있으므로 README 나 config 주석에 **"이 값들은 교체 전제" 안내가 필수**. 이번에 README 현실화(태스크 6) 의 "2. 설정 파일 수정" 섹션에 그런 맥락 반영.

### 5. README fiction 누적 (태스크 6)

4 주 동안 실제 구현 범위가 움직이는 사이 README 는 1주차 시점 스냅샷으로 고정돼 "다중 테마 5 종", "계좌 복사", "사진 갤러리 lightbox" 등 미구현 기능을 기본 탑재로 광고하는 상태 유지. Dead link 4 개도 OSS 첫 방문자에게는 "이 프로젝트 관리 안 되나?" 인상.

- **교훈**: README 는 **"현재 실제 가능한 것" 경계선이 매주 움직이는 살아있는 문서**. 매 주차 종료 시 README 의 모든 구체적 기능 언급이 실제 코드와 일치하는지 리뷰 리듬이 필요. 5주차 현실화 이후로는 이 리듬을 회고 작성 직전 체크리스트화.
- **절충**: "v1.0 목표" 나 "v1.1+ 로드맵" 섹션을 README 에 함께 두면 aspirational 한 비전을 포기하지 않으면서도 현재 상태와 분리 가능. 이번 수정이 그 패턴 채택.

### 6. `80737ff` 로드맵 커밋의 Prettier 미통과 → 포맷 커밋 분리 (태스크 2 와 묶임)

로컬에서 `docs/00-roadmap.md` 를 작성해 `80737ff` 로 커밋했는데 `npm run format:check` 에서 마크다운 테이블 셀 패딩 + 블록 사이 빈 줄이 Prettier 규칙과 불일치. 원격 push 전에 발견. `80737ff` 를 amend 해서 포맷 수정본을 덮어쓸지, 별도 커밋으로 분리할지 고민.

- **결정**: **별도 커밋 (`ef4bf68 chore: Prettier 기준으로 docs/00-roadmap.md 포맷 정리`)**. CLAUDE.md 의 "Always create NEW commits rather than amending" 원칙을 우선. amend 가 unpublished 커밋이라 이론상 안전하지만 습관 차원에서 지양.
- **교훈**: 새 파일 추가 커밋은 **커밋 직전에 format:check 를 한번 돌리는 습관**이 더 깔끔. 이번엔 놓쳤지만 push 전에 잡혀서 diff 가 깨끗하게 유지됨.

---

## 5주차 체크리스트 최종

4주차 회고의 "5주차로 넘어가는 결정사항 우선 태스크 후보" 6 개:

- [x] 태스크 1 — Vercel 계정 생성 + 첫 배포 → `invitation-kit.vercel.app`
- [x] 태스크 2 — 카카오 공유 end-to-end 검증 (+ UI 개편 대응 · buttons[].link 검증 재현)
- [x] 태스크 3 — 네이버 지도 형제 함수 + Venue 두 번째 버튼
- [x] 태스크 4 — GitHub Actions Node 24 업그레이드 (actions/checkout·setup-node @v6)
- [x] 태스크 5 — OG 이미지 제작·추가 (회고 작성 직후 이미지 파일 준비돼 `726c12b` 로 마감 — `public/images/og.png` 800×396 + `app/layout.tsx` 의 `openGraph`·`twitter` metadata)
- [x] 태스크 6 — README 작성 (1주차 draft 를 실제 구현 기준으로 현실화; 한·영 동시)

예상하지 못했던 추가 성과:

- [x] `docs/00-roadmap.md` 신규 (12주 살아있는 로드맵 + 1-4주차 실제 기록)
- [x] `kakao-sdk.md` 에 새 콘솔 UI 도메인 2 필드 분리 표 추가 + buttons[].link 검증 규칙 하위 섹션 + 갱신 트리거 리스트에 "콘솔 UI 개편" 한 줄 추가
- [x] 5 번 실기기 Kakao 검증 루틴 체크리스트화 (sendDefault 호출 → 카드 수신 → **카드 본문 탭 · 각 버튼 탭 이동**)

---

## 6주차로 넘어가는 결정사항

### 우선 태스크 후보 (난이도·블로커 순)

1. **계좌번호 복사 섹션** — v0.1.0 Must 의 남은 핵심 기능. `components/sections/Accounts.tsx` 신규 + `lib/clipboard.ts` 헬퍼 (또는 바로 `navigator.clipboard` 사용) + `invitation.config.ts` 의 `accounts` 필드 실사용. 구현 난이도 낮음 (~1~2 시간).
2. **사진 갤러리** — 사용자 실제 청첩장 사진 5-10 장 준비 후 5-6 장면 분할 + lightbox UX. 난이도 중 (이미지 최적화 · 터치 제스처 · iOS Safari 검증 필요). 사진 자원 블로커.
3. **D-day 카운트다운** — 원래 v1.0 스코프였으나 난이도 낮아 MVP 로 당길 수도. `date` config 에서 Date 계산 후 Greeting 섹션 끝 또는 독립 섹션. 서버·클라이언트 시간 차이 주의 (SSR 시 Date.now() 는 빌드 시점 고정 → 클라이언트 hydration 후 재계산 필요).
4. **인앱 웹뷰 안내 UI** — 카카오톡 자체 웹뷰에서 청첩장 열면 `Kakao.Share.sendDefault` 실패 가능 (kakao-sdk.md "Gotcha" 기록). 현재는 폴백(URL 복사) 으로 자연 해소되지만 "카톡으로 받은 링크를 카톡에서 공유" 는 실사용 빈도 매우 높음. UA 분기로 안내 토스트 ("외부 브라우저에서 열어주세요") 띄우는 소규모 개선.

### v0.1.0 MVP 남은 것

MVP 스코프 (메인·인사말·갤러리·지도·계좌·카카오 공유) 중 **갤러리 + 계좌 복사** 2 건만 남음. 6 주차에 둘 다 닫으면 v0.1.0 릴리스 가능. 블로커: 사진 자원.

### 아직 스킵

- 방명록 · RSVP (v1.0+ · Firebase 도입 시점)
- 다중 테마 (v1.0 · 테마 시스템 리팩터 때)
- 웹 에디터 UI (v1.1)
- BGM · 음악 (v1.1)

---

## 6주차 첫 세션 시작 방법

1. `git log --oneline -15` — 5주차 세션 커밋 8 개 + 이 회고 커밋까지 확인
2. **이 파일 (`docs/retrospective/week-05.md`) 을 다시 읽기** — 5주차 결과와 6주차 우선 태스크가 여기
3. `docs/retrospective/week-04.md` 는 필요 시 참조만
4. `ls docs/*week*` 로 주차별 가이드 존재 여부 확인 — 아직 주차별 가이드 없음, 이 회고의 "우선 태스크 후보" 가 가이드
5. **카카오 / Vercel 관련 작업 재등장 시 `.claude/rules/kakao-sdk.md` 자동 참조** — 5주차에 추가된 "도메인 2 필드 분리" 표 + "buttons[].link 검증" 하위 섹션이 핵심
6. 다음 태스크 **한 개** 를 제안 — 6주차 첫 세션은 **태스크 1 (계좌번호 복사)** 가 블로커 없이 바로 착수 가능한 기본 추천. v0.1.0 MVP 의 남은 2 건 (계좌·갤러리) 중 사진 자원 필요 없는 쪽. 갤러리는 사용자가 사진 준비됐다고 알리면 그 쪽으로 전환 가능.
7. 사용자 승인 후 Plan Mode 브리핑 → 구현 → 품질 게이트 → 커밋 → 푸시 → CI 폴링 (3-5 주차 루틴 동일)

---

## CLAUDE.md 업데이트 필요 사항

- 5주차에 `lib/map.ts` 에 `naverMapDeeplink` 추가됨 — CLAUDE.md "파일 구조 (목표) · 진행 상태" 라인이 `lib/map.ts` 를 "카카오맵 딥링크" 로만 표기하면 네이버도 병기. 필요 시 다음 커밋에 묶어 갱신.
- Actions 액션 범프는 별도 CI 섹션 신설 불필요 (YAGNI). "Next.js 16 주의사항" 같은 런타임 가드레일 성격이 아님.

---

## 메트릭 / 비고

- **5주차 커밋 수**: 8 개 (회고 커밋 2 개 제외 — 초회고 `90aa634` + 후속 정정 커밋)
  - `80737ff` · `0c3717a` · `ef4bf68` · `20b215e` · `c3463c2` · `0864e02` · `22e90ad` · `726c12b`
- **미푸시 커밋**: 0 개
- **CI 런**: 6 회 (회고 이후 OG 푸시 1 건 추가), 모두 녹색
- **외부 기여자**: 0 명
- **가장 큰 단일 변화**: README 현실화 커밋 (`22e90ad`, +118 / −86 lines)
- **세션 리듬**: 한 세션에 7 커밋 + 3 개 외부 서비스 작업 (Vercel 첫 배포 + env + 재배포 · 카카오 Developers 앱 생성·도메인 2 필드 등록 · GitHub Actions 버전 범프). 3-4 주차와 유사한 고밀도 리듬 유지
- **의존성 추가**: 0 — Vercel 과 카카오 콘솔 변경은 코드 외 외부 서비스 영역
- **코드 외 외부 서비스 변경**: Vercel 프로젝트 1 개 생성 · env `NEXT_PUBLIC_KAKAO_APP_KEY` 추가 · 수동 Redeploy 1 회 / Kakao Developers 앱 1 개 생성 · JavaScript SDK 도메인 1 건 · 웹 도메인 2 건 (프로덕션 + `map.kakao.com`)
- **공식 docs WebFetch**: 카카오 docs 4~5 페이지 (`kakaologin/prerequisite`, `javascript/getting-started`, `kakaotalk-share`, `kakaotalk-share/common`, `kakaotalk-share/js-link`) — 새 UI 경로 확정용
- **외부 발견·문서화 2 건**: (1) 카카오 콘솔 새 UI 의 도메인 2 필드 분리 정책 (2) `buttons[].link.webUrl` 도 웹 도메인 검증 대상 — 둘 다 `kakao-sdk.md` 에 영구 박음
- **진단 루틴 신설**: Kakao 공유 증상 시 "폴백 경로 vs 정상 경로" 를 빠르게 가르는 3 질문 (토스트·팝업·앱 열림). 실전에서 Network 탭 없이 사용자 증언만으로 진단 가능 확인

---

## 한 줄 총평

> **5주차는 "MVP 코드 인프라가 실제 프로덕션 환경에서 end-to-end 로 동작하는지" 를 처음 검증한 주간.** 카카오 콘솔 UI 개편과 `buttons[].link` 검증 정책이라는 두 외부 제약을 실기기 증상 → 번들 진단 → 공식 docs → 정책 확정 경로로 돌파해 `kakao-sdk.md` 에 영구 규칙으로 박았다. 네이버 지도 형제 함수 · Node 24 범프 · README 현실화 · OG 이미지 마감까지 5주차 태스크 6 개 전부 완료. MVP Must 에 남은 갤러리·계좌 복사 2 건은 6주차로. 12주 로드맵 문서화로 남은 7 주 재조정의 기준점도 세웠다.
