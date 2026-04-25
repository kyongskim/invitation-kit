# API 키 발급 가이드

> 청첩장 배포 전, 카카오톡 공유와 방명록을 사용하려면 두 외부 서비스(카카오·Firebase)에서 키를 발급받아 등록해야 합니다. 둘 다 무료 티어로 충분합니다.

## 무엇이 필요한가

| 서비스       | 키 개수      | 무엇에 쓰이나                  | 필수 여부                                                  |
| ------------ | ------------ | ------------------------------ | ---------------------------------------------------------- |
| **카카오**   | JavaScript 키 1 개 | 카카오톡 공유 카드 전송        | 미발급 시 공유 버튼이 자동으로 "URL 복사" 폴백으로 동작     |
| **Firebase** | config 6 개  | 방명록(Firestore) 저장·조회    | `invitation.config.ts` 의 `guestbook.enabled = false` 면 생략 가능 |

총 **최대 7 개** 변수. 모두 `NEXT_PUBLIC_` 프리픽스로 클라이언트 번들에 노출되는 공개 식별자입니다 — 보호는 카카오 콘솔의 도메인 등록과 Firebase 보안 규칙이 담당하므로 노출 자체는 보안 위협이 아닙니다.

---

## 1. 카카오 (공유 기능)

### 1-1. 카카오 개발자 계정 만들기

[카카오 개발자 사이트](https://developers.kakao.com)에서 카카오 계정으로 로그인 후 약관 동의. 일반 카카오 계정으로 즉시 사용 가능합니다.

### 1-2. 애플리케이션 추가

[내 애플리케이션](https://developers.kakao.com/console/app) > **애플리케이션 추가하기**.

- 앱 이름: 자유 (예: "우리 청첩장")
- 사업자명: 자유 (개인 이름도 OK)
- 카테고리: "기타" 선택

### 1-3. JavaScript 키 복사

생성된 앱 클릭 > 좌측 **앱 설정** > **앱 키** 탭. **JavaScript 키** 한 줄을 복사해 둡니다. 다른 키(REST API · Admin · Native) 는 **사용하지 않습니다** — 클라이언트 번들에 노출돼선 안 되는 키들입니다.

### 1-4. 도메인 등록 — 두 곳에 모두 등록해야 정상 동작

카카오는 도메인을 두 개의 다른 필드로 관리합니다. **한 곳만 등록하면 공유는 동작하는 것처럼 보이지만 카드 본문 링크가 동작하지 않습니다** — 5 주차 실기기 검증으로 확정한 사항입니다.

| 등록 위치                    | 메뉴 경로                                     | 검증 대상                                      |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------- |
| **JavaScript SDK 도메인**    | 앱 설정 > 플랫폼 > Web                        | `Kakao.init()` 의 origin                       |
| **웹 도메인 (Web Domain)**   | 제품 설정 > **카카오톡 공유** > 도메인 (또는 "Web 플랫폼" 통합 화면) | 공유 카드의 `link.webUrl` 호스트              |

등록할 도메인:

- 프로덕션 URL (예: `https://our-wedding.vercel.app`)
- `share.buttons.map` 을 활성화한다면 **`https://map.kakao.com` 도 웹 도메인 쪽에 추가**. 카카오맵 딥링크 버튼이 default 도메인으로 강제 치환되는 사례를 회피합니다.
- **로컬 `http://localhost:3000` 은 등록하지 않습니다.** 카카오 공유는 dev 환경에서 end-to-end 검증이 어렵습니다 (default 도메인 강제 치환 + 캐시 등 변수 다수). 실제 검증은 프로덕션 도메인 + 실기기 카카오톡으로만.
- **Vercel 프리뷰 URL 도 등록 대상이 아닙니다.** 커밋마다 서브도메인이 바뀌어 사전 등록 불가. 프리뷰에선 SDK 로드·초기화까지만 검증되고 실제 공유는 "등록되지 않은 도메인" 에러가 정상입니다.

> 카카오 콘솔 UI 는 자주 개편됩니다. 위 메뉴 이름이 다르게 보이면 핵심은 "**JavaScript 키 자체의 도메인 화이트리스트**" 와 "**카카오톡 공유 제품의 웹 도메인 화이트리스트**" 두 가지 — 둘 다 같은 도메인을 포함하면 됩니다.

### 1-5. `meta.siteUrl` 일치

`invitation.config.ts` 의 `meta.siteUrl` 은 **카카오 콘솔에 등록한 도메인과 정확히 같아야** 합니다. 다르면 카카오가 카드를 만들 때 `link.webUrl` 호스트를 콘솔의 default 도메인으로 강제 치환합니다 — 받은 사람이 버튼을 누르면 엉뚱한 곳으로 이동하는 버그가 됩니다.

발급한 JavaScript 키는 다음 단계의 `.env.local` + Vercel 등록 단계에서 사용합니다.

---

## 2. Firebase (방명록)

### 2-1. 프로젝트 생성

[Firebase Console](https://console.firebase.google.com) > **프로젝트 추가**.

- 프로젝트 이름: 자유 (예: "our-wedding-guestbook")
- **Google Analytics 비활성화 권장** — 활성화하면 config 가 7 필드로 늘어나 본 가이드의 6 필드 가정과 어긋납니다.

### 2-2. Firestore Database 만들기

좌측 사이드바 > **데이터베이스 및 스토리지** > **Firestore Database** > "데이터베이스 만들기" 클릭.

- **버전**: ⚠️ **Standard edition** 선택. **Enterprise edition 금지** — 청첩장 스코프엔 과하고 비용이 발생합니다.
- **위치**: **`asia-northeast3` (서울)** 권장. 한 번 선택하면 영구 변경 불가입니다. 안 보이면 `asia-northeast1` (도쿄) 차선.
- **모드**: **프로덕션 모드로 시작** 선택. ⚠️ **테스트 모드 금지** — 30 일 후 만료되고 그 전엔 누구나 쓰기 가능. (일부 신규 UI 에선 모드 선택이 사라지고 Standard 가 deny-all 프로덕션 기본값일 수 있는데, 그땐 그냥 다음 단계로.)

생성에 1~2 분 걸립니다. 빈 데이터 탭이 보이면 OK.

### 2-3. 웹 앱 등록

좌측 상단 프로젝트 이름 옆 **톱니바퀴 ⚙️** > **프로젝트 설정** > "일반" 탭 > "내 앱" 섹션 > **웹 앱 (`</>`)** 추가.

- 앱 닉네임: 자유
- ⚠️ **"이 앱에 Firebase Hosting 도 설정하기" 체크 해제**. 이 프로젝트는 Vercel 로 배포하므로 Hosting 충돌을 피해야 합니다.

### 2-4. firebaseConfig 6 필드 복사

앱 등록 후 화면에 노출되는 `firebaseConfig` 객체에서 6 개 값을 복사합니다:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc...",
};
```

창을 닫았다면 같은 페이지의 "SDK 설정 및 구성" > "구성" 라디오로 다시 볼 수 있습니다.

### 2-5. 보안 규칙 배포

Firestore Database > **규칙** 탭으로 이동. 레포의 `firestore.rules` 파일 내용을 복사해 붙여넣고 **게시**합니다.

이 규칙은:

- 방명록 읽기는 누구나 허용 (공개 성격)
- 쓰기는 4 필드(`name` · `message` · `passwordHash` · `createdAt`) 만, 길이 제약 검증
- **수정·삭제는 모두 차단** (운영자가 콘솔에서 직접 삭제하는 모델)

> 규칙 게시 후 **최대 1 분** 전파 지연이 있을 수 있습니다.

### 2-6. (선택) Authentication·Storage·Functions 는 켜지 않습니다

이 프로젝트는 Firestore 만 사용합니다. 다른 제품 활성화 단계는 진행하지 마세요 — 혼동만 늘고 무료 쿼터 상한이 분산됩니다.

### UI 변경에 대비한 핵심 4 가지

Firebase Console UI 는 자주 개편됩니다. 메뉴 위치가 달라 보이면 다음 4 가지만 만족시키면 됩니다:

1. **Standard edition** (Enterprise 아님)
2. **`asia-northeast3` (서울)** 위치
3. **프로덕션 모드** 시작 (테스트 모드 아님)
4. 웹 앱 등록 시 **Hosting 체크 해제**

발급한 6 필드는 다음 단계에서 환경 변수로 등록합니다.

---

## 3. 환경 변수 등록 — `.env.local` + Vercel 양쪽 모두

### 3-1. 변수 7 개

| 변수명                                        | 어디서 발급                          | 어디에 등록                                |
| --------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_KAKAO_APP_KEY`                   | 카카오 앱 설정 > 앱 키 > JavaScript 키 | `.env.local` + Vercel                      |
| `NEXT_PUBLIC_FIREBASE_API_KEY`                | Firebase 웹 앱 config > `apiKey`       | `.env.local` + Vercel                      |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`            | Firebase 웹 앱 config > `authDomain`   | `.env.local` + Vercel                      |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`             | Firebase 웹 앱 config > `projectId`    | `.env.local` + Vercel                      |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`         | Firebase 웹 앱 config > `storageBucket`| `.env.local` + Vercel                      |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`    | Firebase 웹 앱 config > `messagingSenderId` | `.env.local` + Vercel                 |
| `NEXT_PUBLIC_FIREBASE_APP_ID`                 | Firebase 웹 앱 config > `appId`        | `.env.local` + Vercel                      |

### 3-2. 로컬 `.env.local` 작성

레포 루트의 `.env.example` 을 `.env.local` 로 복사한 뒤 각 줄 `=` 뒤에 값을 채웁니다:

```sh
cp .env.example .env.local
```

```env
NEXT_PUBLIC_KAKAO_APP_KEY=실제_키_값
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc...
```

`.env.local` 은 `.gitignore` 에 의해 커밋되지 않습니다 — 그대로 두세요.

`npm run dev` 로 dev 서버를 띄워 카카오톡 공유·방명록이 동작하는지 확인합니다.

### 3-3. Vercel 환경 변수 등록 — 누락하면 프로덕션이 깨집니다

`NEXT_PUBLIC_*` 변수는 Next.js **빌드 시점에 클라이언트 번들로 인라인** 되는 값이라, `.env.local` 만 작성하고 Vercel 에 등록하지 않으면 프로덕션 빌드에서 `undefined` 가 박힙니다 — 런타임에 `auth/invalid-api-key` 또는 `apiKey must be a non-empty string` 류 에러로 SDK 가 죽습니다. (9 주차 v0.2 직후 실제로 겪은 사례입니다.)

등록 절차:

1. Vercel Dashboard > 프로젝트 > **Settings** > **Environment Variables**
2. 7 개 변수를 각각 추가하고, 각 변수마다 **Production · Preview** 환경에 체크 후 **Save**.
   - Development 환경은 Vercel CLI 로 dev 를 돌릴 때만 필요합니다 (`.env.local` 이 우선이라 보통 미체크).
3. **재배포 트리거**: 환경 변수만 추가했다고 자동 재배포되지 않습니다. 다음 중 하나로 트리거:
   - Deployments 탭 > 최신 배포 우측 `...` > **Redeploy** (옵션 모달은 그대로 Redeploy)
   - 또는 빈 commit push:
     ```sh
     git commit --allow-empty -m "chore: trigger Vercel redeploy"
     git push
     ```

---

## 흔한 실수

- **`.env.local` 만 작성하고 Vercel 등록 누락**: dev 는 정상, 프로덕션에서만 SDK init 실패. 변수 7 개 모두 Production · Preview 체크 + 재배포까지가 한 묶음.
- **카카오 도메인 한 곳만 등록**: JavaScript SDK 도메인만 등록 시 공유 카드는 보내지지만 PC 카톡에서 "모바일에서 확인해주세요"·iOS 에서 카드 탭 무반응. 웹 도메인까지 함께 등록해야 합니다.
- **`meta.siteUrl` 과 콘솔 등록 도메인 불일치**: 카드 본문·버튼 URL 의 호스트가 default 로 강제 치환됩니다. 두 값을 정확히 같게 두세요.
- **Firebase 테스트 모드로 시작**: 30 일 후 갑자기 모든 요청이 거부됩니다. 처음부터 프로덕션 모드 + 본 가이드의 보안 규칙으로 시작하세요.
- **Firebase Hosting 함께 활성화**: 웹 앱 등록 시 체크박스를 끄지 않으면 Vercel 과 충돌이 날 수 있습니다.

---

## 다음 단계

키 등록이 끝났다면 → [`config-guide.md`](./config-guide.md) 로 가서 신랑·신부 정보, 식장 위치, 갤러리 사진 등 청첩장 본문 필드를 채우세요.

운영 디테일·보안 근거는 다음 문서에 정리되어 있습니다 (대부분의 사용자는 읽을 필요 없음):

- 카카오 SDK 사용 원칙: [`.claude/rules/kakao-sdk.md`](../.claude/rules/kakao-sdk.md)
- Firebase 보안 규칙·해싱·욕설 필터 설계: [`.claude/rules/firebase.md`](../.claude/rules/firebase.md)
