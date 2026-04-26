# Config 가이드

> `invitation.config.ts` 한 파일에서 청첩장 모든 내용을 제어합니다. 이 문서는 그 파일의 모든 필드를 사용자 시점으로 설명한 매뉴얼입니다.

## 시작하기

1. 레포를 fork (또는 clone) 합니다.
2. 카카오·Firebase 키를 발급받아 `.env.local` 과 Vercel 에 등록합니다 → [`api-keys.md`](./api-keys.md).
3. **레포 루트의 `invitation.config.ts` 를 엽니다.**
4. 본인 정보로 필드를 수정합니다 (이 문서가 가이드).
5. `npm run dev` 로 로컬에서 확인 → `git push` 로 Vercel 자동 배포.

```sh
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # 스키마 위반 즉시 발견
```

청첩장 본문은 `invitation.config.ts` 한 파일만 수정하면 됩니다. 컴포넌트 코드는 건드리지 않는 게 원칙 — config-driven 이 이 프로젝트의 절대 원칙입니다.

---

## 전체 구조

`InvitationConfig` 인터페이스 한눈에:

```ts
{
  meta:      { title, description, siteUrl }       // 페이지 메타데이터·OG 태그
  theme:     "classic" | "modern" | "floral"        // 디자인 테마
  groom:     Person                                 // 신랑 (이름·order·부모)
  bride:     Person                                 // 신부
  date:      string                                 // ISO 8601 + 타임존
  venue:     Venue                                  // 식장 (이름·주소·좌표·교통편)
  greeting:  { title?, message }                    // 인사말
  gallery:   GalleryImage[]                         // 사진 배열
  accounts:  { groomSide, brideSide }               // 양가 계좌
  share:     ShareConfig                            // 카카오톡 공유 카드
  guestbook: GuestbookConfig                        // 방명록 활성·옵션
  music?:    { enabled, src }                       // (선택) 배경 음악
  closing?:  { message?, signature? }               // (선택) 끝인사
}
```

타입 정의는 `invitation.config.ts` 상단에 인라인되어 있습니다 — 표는 그 정의를 그대로 옮긴 것입니다.

---

## meta — 페이지 메타데이터

브라우저 탭 제목, 검색·SNS 공유 시의 OG 태그에 사용됩니다.

| 필드          | 타입   | 기본값                                      | 효과                                      |
| ------------- | ------ | ------------------------------------------- | ----------------------------------------- |
| `title`       | string | `"김철수 ♥ 이영희의 결혼식에 초대합니다"`   | `<title>` · OG title · Twitter card 제목  |
| `description` | string | `"2026년 5월 17일, 저희 두 사람의 시작을…"` | meta description · OG description         |
| `siteUrl`     | string | `"https://invitation-kit.vercel.app"`       | OG URL · 카카오 공유 카드의 `link.webUrl` |

**⚠️ `siteUrl` 은 카카오 콘솔에 등록한 도메인과 정확히 같아야 합니다.** 다르면 카카오가 카드 링크 호스트를 default 로 강제 치환합니다 — [`api-keys.md`](./api-keys.md) 의 1-5 절 참조.

---

## theme — 테마 선택

세 가지 중 하나를 선택합니다.

| 값          | 인상                                                           |
| ----------- | -------------------------------------------------------------- |
| `"classic"` | 따뜻한 베이지·골드, Cormorant Garamond. 한국 결혼식 기본 톤    |
| `"modern"`  | 슬레이트 블랙·화이트, Playfair Display, sharp edges (radius 0) |
| `"floral"`  | 로즈·뮤트한 마우브, Italiana, 살짝 더 둥근 모서리              |

새로운 테마를 추가하려면 [`theme-guide.md`](./theme-guide.md) 참조.

---

## groom · bride — 신랑·신부

```ts
interface Person {
  name: string;
  order?: string; // 예: "장남" "차녀"
  father?: string;
  mother?: string;
}
```

| 필드     | 타입    | 필수 | 효과                                               |
| -------- | ------- | ---- | -------------------------------------------------- |
| `name`   | string  | ✓    | 메인 화면·인사말 등 모든 위치에 표시               |
| `order`  | string? | -    | 양가 부모 라인 옆 (예: "김아버지·박어머니의 장남") |
| `father` | string? | -    | 부모 라인. 미설정 시 부모 라인 자체가 생략됨       |
| `mother` | string? | -    | 부모 라인. 미설정 시 부모 라인 자체가 생략됨       |

**부모 한 분만 표기**해야 하는 경우 (예: 한쪽 부모를 여의신 경우) `father` 만 또는 `mother` 만 채우면 됩니다 — 빈 쪽은 자동으로 생략됩니다.

---

## date — 예식 일시

```ts
date: "2026-05-17T12:00:00+09:00";
```

**ISO 8601 + 타임존 (`+09:00` KST) 권장.** 이 값은:

- 메인 화면의 날짜·시간 표시
- D-day 배지 (현재 날짜와 비교)
- 카카오 공유 카드의 자동 description (필요 시)
- 캘린더 추가 버튼의 시작 시각

타임존 없이 `"2026-05-17T12:00:00"` 만 쓰면 사용자 브라우저의 로컬 시각으로 해석돼 해외 하객 화면에서 날짜가 어긋날 수 있습니다.

---

## venue — 식장

```ts
interface Venue {
  name: string;
  hall?: string;
  address: string;
  coords: { lat: number; lng: number };
  transportation?: { subway?; bus?; car?; parking? };
}
```

| 필드                        | 타입    | 필수 | 예시                                             |
| --------------------------- | ------- | ---- | ------------------------------------------------ |
| `name`                      | string  | ✓    | `"더채플 광화문"`                                |
| `hall`                      | string? | -    | `"2층 그랜드볼룸"`                               |
| `address`                   | string  | ✓    | `"서울특별시 종로구 세종대로 175"` (도로명 권장) |
| `coords.lat` · `coords.lng` | number  | ✓    | `37.5725` · `126.9769`                           |
| `transportation.subway`     | string? | -    | `"5호선 광화문역 2번 출구 도보 5분"`             |
| `transportation.bus`        | string? | -    | `"간선 101, 103 광화문 정류장 하차"`             |
| `transportation.car`        | string? | -    | `"내비게이션에 \"더채플 광화문\" 검색"`          |
| `transportation.parking`    | string? | -    | `"건물 지하 주차장 2시간 무료"`                  |

### 좌표 얻는 법

#### 옵션 A — `npm run geocode` (CLI 자동, 추천)

1. Kakao Developer Console > 앱 키 > **REST API 키** 복사 (JavaScript 키와 별개, 같은 앱 안에 있음)
2. `.env.local` 에 추가: `KAKAO_REST_API_KEY=발급받은_키`
3. `invitation.config.ts` 의 `venue.address` 정확하게 입력 (도로명 주소 권장)
4. 터미널에서 `npm run geocode` 실행
5. 출력된 `coords: { lat, lng }` 한 줄을 `invitation.config.ts` 의 `venue.coords` 자리에 paste

#### 옵션 B — 지도에서 직접 따내기 (수동)

1. [카카오맵](https://map.kakao.com) 또는 [네이버 지도](https://map.naver.com) 에서 식장 검색.
2. **카카오맵**: 결과 > 우측 상단 "공유" > URL 의 좌표 파라미터 복사. 또는 지도에서 식장 핀 위 우클릭 > "좌표 보기".
3. **네이버 지도**: 식장 핀 우클릭 > "이 위치 좌표".

정확도는 소수점 4 자리 (10m 정도) 면 충분합니다. 좌표는:

- 카카오맵 딥링크 (`share.buttons.map` 활성 시)
- 네이버 지도 버튼
- 길찾기 링크

생성에 사용됩니다.

**⚠️ `share.buttons.map` 을 활성화한다면** 카카오 콘솔 웹 도메인에 `https://map.kakao.com` 도 추가해야 합니다 — [`api-keys.md`](./api-keys.md) 1-4 절.

---

## greeting — 인사말

```ts
greeting: {
  title?: string;
  message: string;
}
```

| 필드      | 타입    | 필수 | 효과                                       |
| --------- | ------- | ---- | ------------------------------------------ |
| `title`   | string? | -    | 인사말 섹션 헤드라인                       |
| `message` | string  | ✓    | 인사말 본문. `\n` 으로 줄바꿈, `\n\n` 단락 |

JSX 의 `<br />` 도 지원하지만 `\n` 이 더 가독성이 좋습니다.

```ts
message: "서로의 다름을 존중하고 같음을 기뻐하며\n\n한 길을 걸어가려 합니다.\n\n축복해 주시면 감사하겠습니다.",
```

---

## gallery — 사진 갤러리

```ts
gallery: GalleryImage[]

interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
```

| 필드               | 타입    | 필수 | 효과                                                                   |
| ------------------ | ------- | ---- | ---------------------------------------------------------------------- |
| `src`              | string  | ✓    | `public/images/gallery/` 기준 상대 경로 (예: `/images/gallery/01.jpg`) |
| `alt`              | string  | ✓    | 접근성 대체 텍스트                                                     |
| `width` · `height` | number? | 권장 | 원본 픽셀 크기. 레이아웃 안정화 (CLS 방지)                             |

### 사진 추가 절차

1. JPEG 또는 PNG 파일을 `public/images/gallery/` 에 복사 (예: `wedding-01.jpg`).
2. `gallery` 배열에 항목을 추가:
   ```ts
   { src: "/images/gallery/wedding-01.jpg", alt: "본식 입장", width: 1200, height: 1500 },
   ```
3. 원본 가로/세로를 같이 적습니다 — Next.js Image 가 비율을 잡아 모바일에서 갑자기 점프하는 현상을 막습니다.

권장 사진 매수: **9~12 장**. 예시 config 는 9 장입니다. 너무 많으면 첫 페인트가 느려지고 너무 적으면 갤러리 섹션이 빈약해 보입니다.

이미지 최적화는 Next.js Image 컴포넌트가 자동 처리하므로 원본을 넣어도 OK입니다. 다만 한 장당 5MB 이상이면 Vercel 빌드 시간이 늘어나니 사전에 `~2MB` 이하로 압축을 권장합니다.

---

## accounts — 양가 계좌

```ts
accounts: {
  groomSide: Account[];
  brideSide: Account[];
}

interface Account {
  label: string;
  bank: string;
  number: string;
  holder: string;
  kakaoPayUrl?: string;
  tossUrl?: string;
}
```

| 필드          | 타입    | 필수 | 예시                                 |
| ------------- | ------- | ---- | ------------------------------------ |
| `label`       | string  | ✓    | `"신랑"` · `"신랑 아버지"`           |
| `bank`        | string  | ✓    | `"국민은행"`                         |
| `number`      | string  | ✓    | `"123-45-678901"` (하이픈 포함 권장) |
| `holder`      | string  | ✓    | 예금주 이름                          |
| `kakaoPayUrl` | string? | -    | 카카오페이 송금 딥링크               |
| `tossUrl`     | string? | -    | 토스 송금 딥링크                     |

양가 분리 표시가 기본입니다. 한쪽 계좌만 받는다면 빈 배열 (`brideSide: []`) 도 가능 — 빈 쪽 카드는 렌더링되지 않습니다.

`kakaoPayUrl` · `tossUrl` 미설정 시 해당 버튼은 표시되지 않습니다 — 계좌번호 복사 버튼만 노출됩니다.

---

## share — 카카오톡 공유 카드

```ts
interface ShareConfig {
  title: string;
  description: string;
  thumbnailUrl: string;
  buttons?: {
    site?: { enabled?: boolean; label?: string };
    map?: { enabled?: boolean; label?: string };
  };
}
```

| 필드                   | 타입    | 기본값                                                  | 효과                                                    |
| ---------------------- | ------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `title`                | string  | `"김철수 ♥ 이영희 결혼합니다"`                          | 카카오톡 카드 상단 굵은 글씨                            |
| `description`          | string  | `"2026년 5월 17일 토요일 낮 12시 · 더채플 광화문"`      | 카드 본문 한 줄                                         |
| `thumbnailUrl`         | string  | `"https://invitation-kit.vercel.app/images/og.jpg?v=2"` | **절대 URL 필수.** 800×400 권장 비율                    |
| `buttons.site.enabled` | bool?   | 미설정 시 `true`                                        | 카드 좌측 "청첩장 보기" 버튼. URL 자동 = `meta.siteUrl` |
| `buttons.site.label`   | string? | `"청첩장 보기"`                                         | 버튼 라벨 커스텀                                        |
| `buttons.map.enabled`  | bool?   | 미설정 시 `false`                                       | 카드 우측 "지도 보기" 버튼. URL 자동 조립               |
| `buttons.map.label`    | string? | `"지도 보기"`                                           | 버튼 라벨 커스텀                                        |

### 썸네일 이미지 규칙

- **반드시 절대 URL** (`https://...`). 상대 경로는 카카오 서버가 fetch 못 합니다.
- **호스트가 카카오 콘솔 웹 도메인 등록 도메인이어야** 합니다. 미등록 도메인의 이미지는 default 로 강제 치환됩니다.
- 권장 크기 800×400. `public/images/og.jpg` 에 본인 이미지를 두고 URL 을 거기로 가리키는 게 가장 단순합니다 (PNG 도 동작하지만 JPG 가 카카오톡 카드 압축에 더 가벼움).
- 이미지 변경 후에도 카카오 CDN 이 강하게 캐시하므로, 즉시 반영 검증이 필요하면 `?v=2` 같은 쿼리스트링을 붙여 새 URL 로 취급시킵니다.

### buttons 활성 조합

| 조합                              | 카드 동작                                             |
| --------------------------------- | ----------------------------------------------------- |
| `site: true`, `map: false` (기본) | 청첩장 보기 버튼 1 개. 카드 본체 탭 = 청첩장으로 이동 |
| `site: true`, `map: true`         | 두 버튼 노출. 카드 본체 탭 = 청첩장                   |
| 둘 다 비활성                      | 버튼 없음. 카드 본체 탭 = `meta.siteUrl`              |

카카오 feed 템플릿은 최대 2 개 버튼까지 — 본 스키마가 그 제한을 그대로 반영합니다.

---

## guestbook — 방명록

```ts
interface GuestbookConfig {
  enabled: boolean;
  minPasswordLength?: number;
  profanityFilter?: boolean;
}
```

| 필드                | 타입     | 기본값 | 효과                                                                    |
| ------------------- | -------- | ------ | ----------------------------------------------------------------------- |
| `enabled`           | boolean  | -      | `false` 시 방명록 섹션 자체가 렌더링되지 않음. Firebase 키도 생략 가능  |
| `minPasswordLength` | number?  | `4`    | 메시지 작성 시 비밀번호 최소 길이                                       |
| `profanityFilter`   | boolean? | `true` | 욕설 필터 활성. 부모 세대 이름 false positive 발생 시 `false` 로 비활성 |

방명록 데이터는 Firebase Firestore 에 저장됩니다. 사용 절차는 [`api-keys.md`](./api-keys.md) 의 2 절 참조.

**비밀번호의 의미**: 현재 MVP 는 **삭제 기능을 제공하지 않습니다** (모든 삭제는 운영자가 Firebase Console 에서 수동). 비밀번호는 미래 삭제 기능 도입 대비로 해시 저장만 하고 검증 경로는 두지 않습니다 — 이 결정의 근거는 [`.claude/rules/firebase.md`](../.claude/rules/firebase.md) "삭제 전략" 섹션.

**욕설 필터**: 한국어 574 단어 (`badwords-ko` MIT) + 자체 자음 변형 보강. 부모 세대 특수 이름·single-char 단어 false positive 가능성이 있어 비활성 옵션 제공. 운영자는 Firebase Console 에서 수동 삭제도 가능합니다.

---

## rsvp — 참석 의사 응답

```ts
interface RSVPConfig {
  enabled: boolean;
  deadline?: string;
  message?: string;
  fields?: {
    companions?: boolean;
    message?: boolean;
  };
}
```

| 필드                | 타입     | 기본값                                                      | 효과                                                                            |
| ------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `enabled`           | boolean  | -                                                           | `false` 시 RSVP 섹션 자체가 렌더링되지 않음                                     |
| `deadline`          | string?  | 미설정 시 항상 활성                                         | ISO 8601 + 타임존 (예: `"2026-05-14T23:59:59+09:00"`). 마감 후 form 자동 비활성 |
| `message`           | string?  | `"참석 여부를 알려주시면\n결혼식 준비에 큰 도움이 됩니다."` | 폼 상단 안내 문구. `\n` 으로 줄바꿈                                             |
| `fields.companions` | boolean? | `true`                                                      | `false` 면 동반 인원 입력란 숨김 (페이로드는 `0` 으로 고정)                     |
| `fields.message`    | boolean? | `true`                                                      | `false` 면 메시지 입력란 숨김 (페이로드는 `""` 으로 고정)                       |

**수집 필드 (Firestore `rsvp` 컬렉션)**: `name` (1~20자) · `attendance` (`yes`/`no`) · `side` (`groom`/`bride`) · `companions` (0~5 정수, 본인 제외) · `message` (0~200자) · `createdAt`.

**read 차단**: RSVP 응답은 사적 정보 (참석/불참 + 동반 인원) 라 다른 하객에게 노출되지 않습니다. `firestore.rules` 의 `rsvp` 컬렉션은 `allow read: if false`. **운영자는 [Firebase Console](https://console.firebase.google.com) > Firestore Database > Data 탭** 에서 `rsvp` 컬렉션을 직접 조회·정렬·CSV 내보내기. 자세한 결정 근거는 [`docs/adr/008-rsvp-data-model-and-rules.md`](./adr/008-rsvp-data-model-and-rules.md).

**UX 동작**: 첫 방문 시 자동 모달 popup 으로 응답 폼 노출 (sessionStorage 로 세션당 1회). 닫기는 X 버튼 · backdrop 클릭 · ESC 키 모두 동작. inline 섹션 "참석 의사 보내기" 버튼이 모달을 다시 띄움. **응답 후엔** 성공 카드 + "응답을 수정하거나 다시 보낼게요" 링크 — 클릭 시 빈 폼 모달 재오픈, 다시 submit 하면 **새 doc 으로 저장** (Firestore 단 update 차단 — ADR 008). 운영자가 Firebase Console 에서 같은 이름의 중복을 createdAt 기준으로 마지막 응답만 인정.

**마감일은 클라이언트 단 비활성**: form disable 은 시각적 안내. DevTools 우회로 마감 후에도 submit 가능 — 청첩장 도메인 위협 모델 약함을 전제로 한 트레이드오프. vandalism 사례 발생 시 ADR 008 의 "미래 트리거" 절 참조.

---

## music — 배경 음악 (선택)

```ts
music?: {
  enabled: boolean;
  src: string;
}
```

| 필드      | 타입    | 효과                                                                   |
| --------- | ------- | ---------------------------------------------------------------------- |
| `enabled` | boolean | `true` 시 우상단 floating 토글 버튼 노출 (`enabled=false` 면 미마운트) |
| `src`     | string  | `public/` 기준 상대 경로 (예: `"/audio/wedding.mp3"`) 또는 절대 URL    |

### UX 동작

- **자동재생 시도하지 않음.** iOS Safari 의 무음 모드 + Low Power Mode + autoplay 정책 변수가 너무 많아 시도 자체가 음수 ROI. 사용자가 우상단 스피커 버튼을 눌러야만 재생.
- **첫 클릭**: `audio.play()` → fade-in 300ms (volume 0→1) → 재생 상태로 전환. 트랙 끝나면 `loop` 으로 자동 반복.
- **다시 클릭**: fade-out 300ms (volume 현재값→0) → pause. 다음 클릭 시 같은 위치에서 재생 재개.
- **에러**: 음원 404 / 디코딩 실패 시 console 에러 + 버튼 상태 `error` (사용자에겐 visual feedback 없음 — MVP 범위).

### 음원 파일

- **OSS 라이선스 제약으로 본 레포에 샘플 음원을 ship 하지 않습니다.** `public/audio/.gitkeep` 만 있는 빈 디렉토리. 본인 음원을 추가해서 사용.
- 권장 음원 출처: **CC0 / Public Domain** ([Pixabay Music](https://pixabay.com/music/), [FreePD](https://freepd.com/), [Free Music Archive](https://freemusicarchive.org/) CC0 필터). 라이선스가 명확한 트랙만 — 청첩장은 짧게 운영되더라도 공개 URL 입니다.
- 형식: `.mp3` 가 가장 호환성 높음 (`.ogg`, `.m4a` 도 가능하나 일부 브라우저 제외 사례). 비트레이트 128~192kbps 권장 — 모바일 데이터 절약.
- 길이: 보통 2~4분 트랙 1개를 loop. 너무 짧은 트랙 (10~30초) 은 loop 이음새가 거슬릴 수 있음.

### iOS 무음 모드 (해결 불가)

- iPhone 의 측면 ringer 스위치가 OFF (오렌지 라인 보임) 이면 청첩장 음악이 들리지 않습니다. **JavaScript 레벨에서 우회 불가** — Safari 의 의도적 차단.
- 안내 문구를 페이지에 두고 싶으면 `greeting.message` 또는 `closing.message` 에 "🔊 무음 모드를 해제하시면 음악이 재생됩니다" 한 줄 추가 권장.

### 비활성

- `music.enabled = false` 또는 `music` 키 자체 생략 시 토글 버튼이 마운트되지 않습니다. 청첩장이 audio 자산을 fetch 하지도 않음 (preload 안 됨).

---

## closing — 끝인사 (선택)

```ts
closing?: {
  message?: string;
  signature?: string;
}
```

| 필드        | 타입    | 예시                                            |
| ----------- | ------- | ----------------------------------------------- |
| `message`   | string? | `"귀한 걸음으로 축복해 주시면 감사하겠습니다."` |
| `signature` | string? | `"김철수 · 이영희 드림"`                        |

생략 가능. 두 필드 모두 비워두면 closing 섹션이 렌더링되지 않습니다.

---

## 검증 체크리스트

본인 정보로 채운 뒤 다음을 확인하세요.

### 로컬

```sh
npm run typecheck
npm run dev
```

- `typecheck` — 스키마 위반 (필수 필드 누락, 잘못된 타입) 즉시 발견. 빨간 줄이 있으면 push 하지 말 것.
- `dev` 후 `http://localhost:3000` — 데스크톱 + Chrome 모바일 시뮬레이터 둘 다 확인.

### 모바일 실기기

청첩장의 1 순위 타깃은 **모바일 Safari**. 다음 시나리오를 실기기로 검증:

- iOS Safari 에서 첫 페인트 → 갤러리 스크롤 → 카카오톡 공유 (실기기 카카오톡 설치 필요) → 방명록 작성
- Android Chrome 에서 동일

### 프로덕션 직전

```sh
rm -f .eslintcache && npm run lint && npm run typecheck && npm run format:check && npm run build
```

CI 와 동일한 quality gate 입니다. `format:check` 누락 시 `prettier` 가 잡지 못한 미포맷 파일이 CI 에서 빨간불이 됩니다.

---

## 다음 단계

- 키 발급이 아직이라면 → [`api-keys.md`](./api-keys.md)
- 새로운 테마를 추가하고 싶다면 → [`theme-guide.md`](./theme-guide.md)
- Vercel 배포 절차 일반은 → [`03-claude-code-setup.md`](./03-claude-code-setup.md) 또는 레포 README

설계 근거 문서 (대부분의 사용자는 읽을 필요 없음):

- 프로젝트 기획·타깃·MoSCoW: [`01-project-brief.md`](./01-project-brief.md)
- 12 주 로드맵: [`00-roadmap.md`](./00-roadmap.md)
- 디자인 결정 기록: [`adr/`](./adr/) (테마 시스템 · 공유 버튼 스키마 · 욕설 필터 등 6 건)
