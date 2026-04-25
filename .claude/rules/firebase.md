# Firebase 규칙

> 이 프로젝트에서 Firebase (방명록 · 향후 RSVP) 를 구현할 때 따르는 원칙. CLAUDE.md 의 Progressive Disclosure 로 "Firebase/방명록 관련 작업 시" 자동 참조.

## Scope

**이 규칙의 적용 범위**:

- 방명록 (Firestore `guestbook` 컬렉션)
- 향후 RSVP — 같은 Firebase 앱 · 같은 `NEXT_PUBLIC_FIREBASE_*` 환경 변수 재사용. 실제 RSVP 스키마 등장 시 "Firestore 스키마" 섹션에 이웃 표 추가로 확장

**적용 범위 밖 (별도 규칙 파일 없이 당장 도입 금지)**:

- Firebase Auth (OAuth, 이메일 로그인)
- Cloud Functions
- Cloud Storage
- Realtime Database (Firestore 와 별개 제품)
- Remote Config, Analytics, App Check
- **Admin SDK / Service Account — 영구 범위 밖.** 이 프로젝트는 클라이언트 전용 아키텍처. 서버 비밀키가 필요한 순간이 오면 Next.js Route Handler (서버) 로 분리 + Vercel 환경변수로 별도 관리

범위 확장이 필요해지는 순간 이 파일을 먼저 갱신하거나 별도 규칙 파일을 분리한다.

## SDK 버전·설치

- **`firebase` npm 패키지 · modular SDK (v9+ tree-shakeable API)** 를 사용. `firebase/compat/*` 경로 **금지** — 번들 사이즈 영향 + 공식 deprecation 경로.
- **버전 번호는 이 파일에 하드코딩하지 않는다.** 도입 시점 `npm install firebase` 로 최신 메이저를 받고, 메이저 바뀔 때 이 규칙 갱신.
- **쓸 모듈만 import**: `firebase/app`, `firebase/firestore`. Auth · Storage 등 미도입 모듈은 import 하지 않는다 — tree-shake 효과 유지.

## 초기화

```ts
// 의사코드 — 실제 구현은 lib/firebase.ts 에 캡슐화
import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
```

- **`getApps().length` 가드 선행.** Next.js dev HMR 이 모듈을 재평가할 때 `initializeApp` 이 중복 호출되면 `FirebaseError: Firebase: Firebase App named '[DEFAULT]' already exists` 예외로 터진다. 카카오 SDK 의 `isInitialized()` 가드와 동일한 의도.
- **`lib/firebase.ts` 싱글톤.** 앱/페이지 단위 재init 금지. `db` 인스턴스를 import 해서 재사용.
- **SSR 호출 허용** — Firebase JS SDK modular 는 Node 환경에서도 init 안전. 다만 **Firestore 읽기/쓰기는 Client Component 에서만** 수행 (아래 `Next.js 통합 패턴` 참조).

## 환경 변수

- **6 개 변수 전부 `NEXT_PUBLIC_` 프리픽스.** Firebase 웹 SDK config 는 설계상 공개 식별자 — 코드에 포함돼도 **보안 위험 아님**. 실제 보호는 **Firestore 보안 규칙 + 콘솔의 Authorized Domains** 가 담당 (Google 공식 입장: "The apiKey in this configuration snippet just identifies your Firebase project on the Google servers. It is not a security risk").
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

- **Admin SDK `serviceAccountKey.json` · Service Account Private Key 는 절대 저장소·프론트엔드 노출 금지.** 현재 프로젝트는 Admin SDK 사용 계획 없음. 도입이 필요해지는 시점이 오면 Next.js Route Handler (서버) 로 분리.
- 개발 로컬은 `.env.local` (gitignored), 프로덕션은 Vercel Environment Variables. 두 곳 외의 위치 (코드, `.env`, README 예시) 에 실제 키를 기록하지 않는다.
- **`.env.example` 은 실제 Firebase SDK 도입 커밋에서** 6 줄 빈 값 샘플 추가 (본 규칙 커밋엔 포함하지 않음). 카카오 키와 동일 정책.

## Firebase Console 설정 (사용자 직접)

**외부 콘솔 작업은 사용자가 직접 수행한다.** Claude 는 원격 콘솔 조작 불가. 이 섹션은 안내 시 참조 소스.

⚠️ **Firebase Console UI 는 자주 바뀐다** — 이 단계 번호와 메뉴 이름은 2026-04-25 기준 스냅샷. 화면이 다르게 보이면 아래 **핵심 4 가지** (① Standard edition ② asia-northeast3 ③ 프로덕션 모드 ④ Hosting 체크 해제) 만 잘 만족시키면 OK. UI 변경 발견 시 이 섹션을 그때그때 갱신.

1. [Firebase Console](https://console.firebase.google.com) 접속 → 프로젝트 생성. 프로젝트 이름 임의. **Google Analytics 비활성화 권장** — 활성화 시 config 가 7 필드 (`measurementId` 추가) 로 늘어나 이 규칙이 가정한 6 필드 환경과 어긋남.
2. 좌측 사이드바 > **데이터베이스 및 스토리지** (Database & Storage) 그룹 > **Firestore Database** > "데이터베이스 만들기" 클릭.
3. **버전 선택**: ⚠️ **Standard edition** 선택. **Enterprise edition 금지** — 청첩장 스코프엔 과하고 비용 발생 + 기능 분리. Spark (무료) 플랜은 Standard 에서만 적용.
4. **위치 선택**: **`asia-northeast3` (서울)** 권장. 한 번 선택하면 영구 변경 불가. 안 보이면 `asia-northeast1` (도쿄) 차선.
5. **모드 선택** (위치 선택 _후_ 에 나오는 화면): **프로덕션 모드로 시작** 선택. **테스트 모드 금지** (30일 후 만료 + 그 전엔 누구나 쓰기 가능). 단, 일부 신규 UI 에선 모드 선택 자체가 사라지고 Standard 기본값이 deny-all 프로덕션 모드인 경우도 있음 — 그때는 그냥 다음 단계로.
6. **사용 설정** 클릭 → 1~2분 프로비저닝 대기 → 빈 Firestore 데이터 탭 화면.
7. 좌측 상단 프로젝트 이름 옆 **톱니바퀴 (⚙️)** > **프로젝트 설정** > "일반" 탭 > "내 앱" 섹션 > **웹 앱 (`</>`)** 추가. 앱 닉네임 임의. ⚠️ **"이 앱에 Firebase Hosting 도 설정하기" 체크 해제** (Vercel 사용 — Hosting 충돌 회피).
8. **앱 등록** 클릭 → 화면에 노출되는 `firebaseConfig` 객체 6 필드를 `.env.local` · Vercel Environment Variables 양쪽에 복사. (창 닫은 뒤엔 같은 페이지의 "SDK 설정 및 구성" > "구성" 라디오로 다시 노출 가능.)
9. Authentication · Storage · Functions 는 **활성화하지 않는다** (범위 밖).
10. **Authorized Domains** (Authentication > Settings) 는 Auth 미사용인 현 단계에서는 기본값 유지. Auth 도입 시에만 프로덕션 도메인 추가.

## Firestore 스키마

### `guestbook/{autoId}` (auto-generated document ID)

| 필드           | 타입        | 설명                                                |
| -------------- | ----------- | --------------------------------------------------- |
| `name`         | `string`    | 작성자 이름. 1~20자.                                |
| `message`      | `string`    | 메시지 본문. 1~500자.                               |
| `passwordHash` | `string`    | 삭제용 비밀번호의 bcryptjs 해시 (60자 고정 문자열). |
| `createdAt`    | `Timestamp` | `serverTimestamp()` 로 생성. 정렬 기준.             |

- **`createdAt` 은 반드시 `serverTimestamp()` sentinel.** `new Date()` / `Timestamp.now()` 금지 — 서버 시각 · 단조성 · 타임존 독립성이 한 번에 해결되고, 보안 규칙에서 `request.time` 과의 동등 비교로 클라이언트 시계 조작을 차단할 수 있다.
- **원본 비밀번호는 Firestore 에 저장하지 않는다.** `passwordHash` 만 저장. 평문 저장은 OSS 템플릿으로 배포되는 순간 모든 사용자가 같은 설계 결함을 복제하는 결과라 치명.
- 추가 필드 (`isAdmin`, `deleted` 같은) 는 **현재 스키마에 없다.** 삭제 전략은 아래 "보안 규칙" 의 MVP=C 경로 (delete 금지) 참조. 스키마 확장 시 **보안 규칙의 `hasOnly([...])` 목록도 동일 커밋에서 갱신** 필수.

`invitation.config.ts` 의 `GuestbookConfig` (`enabled`, `minPasswordLength`, `profanityFilter`) 는 **UI 동작 제어용** 이고 Firestore 스키마와 1:1 대응 아님.

## Firestore 보안 규칙

`firestore.rules` (Firebase Console > Firestore > "규칙" 탭에 붙여넣기):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbook/{id} {
      allow read: if true;

      allow create: if
        request.resource.data.keys().hasOnly(['name', 'message', 'passwordHash', 'createdAt'])
        && request.resource.data.name is string
        && request.resource.data.name.size() >= 1
        && request.resource.data.name.size() <= 20
        && request.resource.data.message is string
        && request.resource.data.message.size() >= 1
        && request.resource.data.message.size() <= 500
        && request.resource.data.passwordHash is string
        && request.resource.data.passwordHash.size() == 60
        && request.resource.data.createdAt == request.time;

      allow update: if false;
      allow delete: if false;
    }
  }
}
```

### 삭제 전략 — 왜 `allow delete: if false;` 인가

비밀번호 기반 "본인 글만 삭제" 는 Firebase Auth 없이 **Firestore 보안 규칙만으로는 안전하게 구현 불가**. 3 가지 후보를 비교한 결과 MVP 는 **C 경로**.

1. **A. Cloud Function 프록시** — 클라이언트가 `{docId, password}` 를 Function 에 보내고, Function 이 bcrypt 비교 후 admin 권한으로 삭제. 안전하나 **이 규칙 파일 Scope 에서 Cloud Functions 를 제외**했으므로 MVP 밖. v1.0 이후 도입 시 이 섹션 개정.
2. **B. Soft delete (update 로 tombstone)** — `allow update` 를 한 필드 (`deletedAt`) 추가로만 허용하는 룰. 하지만 **"본인만 tombstone 가능" 을 룰로 증명할 수 없다** — 어느 클라이언트든 아무 문서의 tombstone 을 설정할 수 있어 악의적 vandalism 가능. **거부**.
3. **C. Delete 허용 안 함 + UI 에서 삭제 버튼 미노출 + "삭제는 운영자 문의" 안내.** 가장 안전. MVP 적합.

→ **C 채택.** `passwordHash` 필드는 스키마에 유지 (v1.0 이후 A 경로 이행 시 기존 데이터와 호환되도록 미래 대비 저장). UI 에서는 비밀번호 입력을 받아 해싱 후 Firestore 에 함께 저장만 하고, 실제 검증 경로는 두지 않는다.

### 기타 규칙 메모

- `allow read: if true;` — 방명록은 공개 성격. 스팸·스크래핑 우려 시 **App Check** 도입 (v1.1+ 후보).
- `request.resource.data.createdAt == request.time` — 클라이언트 `serverTimestamp()` sentinel 은 서버 시각으로 치환되므로 이 비교가 통과. 클라이언트가 임의 Timestamp 를 직접 넣으면 실패.
- **스키마 변경 시 `hasOnly([...])` 목록 갱신 필수** — 규칙 갱신 누락이 Firestore 에서 가장 흔한 사일런트 실패 (create 가 이유 없이 실패 또는 과허용).

## 비밀번호 해싱

- **라이브러리**: `bcryptjs` (pure JS, 브라우저 · Node 동시 지원). **`bcrypt` (native binding, Node 전용) 금지** — Next.js 클라이언트 번들 불가.
- **salt rounds: 10** (2026 기준 client-side 적정값. 12 이상은 저사양 모바일에서 체감 지연).
- `lib/hash.ts` 에 `hashPassword(plain: string): Promise<string>` 로 캡슐화. 호출측은 `bcryptjs` 를 직접 import 하지 않는다.
- **해시 길이 60자 고정** (`$2a$10$...` 포맷) — 보안 규칙의 `passwordHash.size() == 60` 과 일치시켜 과거/미래 알고리즘 혼입을 차단.

### 클라이언트 해싱의 한계와 MVP 맥락

- DevTools 로 임의 해시를 `passwordHash` 에 넣는 것은 막지 못한다. 본인이 본인 글에 대해 하는 행위라 자체 위협은 아니다.
- 타인이 내 글을 삭제하는 것은 위 "보안 규칙 C 경로" 로 모든 delete 가 막혀 있어 **불가능**. 해싱의 현재 역할은 **미래 삭제 기능 도입 대비 저장** 으로 수렴.
- 평문 저장 금지 원칙은 변함 없음 — 하객이 다른 서비스에서 재사용하는 비밀번호가 평문으로 Firestore 에 남는 설계는 OSS 템플릿 기준 허용 불가.

## 욕설 필터

- **클라이언트 단순 필터.** 작성 submit 직전에 금칙어 포함 여부 검사 → 포함 시 "부적절한 단어가 포함되어 있습니다" 안내 + submit 차단.
- 금칙어 리스트는 **`lib/profanity.ts` 에 한국어 배열** 로 관리. 외부 npm 의존성 미도입 — Tree-shake 친화적이고 라이브러리 갱신 주기 의존성 차단.
- **단어 데이터는 `yoonheyjung/badwords-ko` (MIT) 의 `badwords.ko.config.json` 을 내재화** (574 단어, 원본 순서 유지, 2026-04-25 시점 main 브랜치 스냅샷). MIT 의무로 라이선스 전문 + Copyright 는 `lib/profanity.ts` 헤더 주석에 그대로 포함. 업스트림 갱신 sync 는 수동 스냅샷 (실수요 발생 시).
- `config.guestbook.profanityFilter === false` 면 필터 자체 스킵. 부모 세대 특수 이름 오탐 · single-char 단어 (덬·봊·앰 등) false positive 회피용 탈출구.
- **서버 검증 없음** — 클라이언트 우회 가능. 의도적 우회자는 소수 + 한국 결혼식 방명록의 실명 문화 + 비개발자 하객 대부분 기본 플로우 사용이라는 가정. 프로덕션에서 사례 발생 시 Cloud Function 프록시 경로 (위 삭제 전략 A) 와 묶어 재설계.
- 필터 통과한 후에도 운영자 (신랑/신부) 가 **Firebase Console 에서 수동 삭제** 가능. Console 삭제는 보안 규칙과 무관하게 프로젝트 소유자 권한으로 즉시 동작. badwords-ko 가 잡지 못한 변형 · 정상 단어 false positive 모두 이 경로로 보완.
- **변형·confusable 정규화는 도입 안 함** — false positive 와 유지 비용 증가. 필요해지는 시점이 오면 별도 lib 또는 외부 패키지 (예: `Tanat05/korcen` Apache-2.0) 도입을 별도 결정으로 검토.

## Next.js 통합 패턴

- **Firestore 읽기/쓰기는 전부 Client Component** (`'use client'`). App Router RSC 에서 Firestore 호출은 기술적으로 가능하나, 보안 규칙의 `request.auth` 없이 동작하는 서버 요청 맥락 + Firestore client SDK 의 긴 연결 유지 성격이 RSC request-lifecycle 과 맞지 않아 일관성 위해 **Client 로 고정**.
- **글로벌 Provider/Context 만들지 않는다.** `lib/firebase.ts` 의 `db` 싱글톤을 필요한 컴포넌트에서 직접 import. 방명록은 1 곳에서만 쓰이므로 Context 는 오버엔지니어링.
- 방명록 `'use client'` 경계는 `components/sections/Guestbook.tsx`. 초안은 **단일 파일**, 200 줄 넘어가면 `GuestbookForm.tsx` + `GuestbookList.tsx` 로 분리.
- **`useIsClient` 훅 rule of three**: 현재 `DDayBadge.tsx:9-13`, `InAppBrowserNotice.tsx:9-13` 에 동일 구현 (useSyncExternalStore 기반). 방명록 form 이 3 번째 사용처가 되는 순간 **`lib/hooks.ts` 로 추출**. 첫 커밋에서 복제 + 직후 커밋에서 추출 2단계 진행도 허용 (실사용 전 premature extraction 방지).
- **`useEffect` 내 setState 주의**: React 19 `react-hooks/set-state-in-effect` rule 재발 위험. Firestore `onSnapshot` 구독 결과를 setState 로 옮길 때 cleanup 함수 올바로 반환. `getDocs` 1회 로드 패턴도 동일 — 6 주차 D-day `useSyncExternalStore` 전환 경험 재참조.

## 테스트

- **로컬 Firestore Emulator**: `firebase emulators:start --only firestore` — 프로덕션 데이터 오염 없이 보안 규칙 · 스키마를 검증. `.firebaserc` · `firebase.json` 신규 파일은 실제 SDK 도입 커밋 시점에 추가. 코드에서는 `process.env.NODE_ENV === 'development'` 조건으로 `connectFirestoreEmulator(db, 'localhost', 8080)` 호출.
- **프로덕션 도메인 실기기 검증**: Vercel 프리뷰에서 prod Firebase 프로젝트 쓰지 말 것. 프리뷰 서브도메인별 Firebase Authorized Domains 등록 불가 (Auth 도입 시 차단) + **스팸 레코드가 prod 에 섞이는 것 방지**. 필요하면 v1.0 이후 `invitation-kit-preview` 별도 Firebase 프로젝트 분리 고려.
- 유닛 테스트 프레임워크 현재 없음 — `hashPassword` · 욕설 필터 같은 pure function 은 수동 브라우저 콘솔 검증. Jest/Vitest 도입은 v1.0 이후 별도 결정.

## Gotcha

- **HMR 중복 init 에러**: 위 `getApps().length` 가드 누락 시 dev 서버의 첫 hot reload 에서 바로 예외. 증상으로 학습하기 전에 규칙으로 박아둠.
- **`serverTimestamp()` vs `Timestamp.now()`**: 클라이언트 쓰기 페이로드의 `createdAt` 은 반드시 `serverTimestamp()` sentinel. `Timestamp.now()` 는 client clock 기반이라 보안 규칙의 `== request.time` 을 통과하지 못한다.
- **Firestore 무료 티어 쿼터**: daily 50K reads · 20K writes · 20K deletes · 1GB storage. 결혼식 1 회 방문자 수 (~500) · 방명록 쓰기 (~100) · 축의금 페이지 여러 번 조회 기준으로 **충분히 여유**. OSS 템플릿을 여러 커플이 같은 Firebase 프로젝트로 공유 운영하는 시나리오는 사용 사례 아님 — 각 커플이 본인 프로젝트를 생성하는 게 전제.
- **보안 규칙 배포 전파**: Firebase Console 에서 규칙 저장 후 **최대 1분** 전파 지연. 이 시간 동안 dev/prod 괴리 가능.
- **프로덕션 모드 기본값 = deny-all**: 콘솔에서 "프로덕션 모드" 로 초기화하면 Firestore 기본 규칙이 `allow read, write: if false;`. 위 `firestore.rules` 를 붙여넣기 전까지는 모든 요청이 거부되는 게 정상.
- **한국어 정렬**: `orderBy('createdAt', 'desc')` 는 Timestamp 기반이라 한글 유니코드 정렬 이슈 없음. 향후 이름 필드 정렬을 추가할 경우 유니코드 정렬이 한국어 가나다 순과 완전히 일치하지 않는 점 참고.

## 이 규칙 파일을 갱신해야 하는 순간

- `firebase` npm **메이저 버전** 이 바뀔 때 (v11 → v12 등)
- **Firebase Console UI 개편** 으로 메뉴 경로·필드 이름이 바뀔 때 — "Firebase Console 설정" 섹션이 경로 기준
- **보안 규칙 DSL 버전** (`rules_version = '2'` → 차세대 v3)
- **스코프 확장**: Firebase Auth · Storage · Cloud Functions · App Check 도입 결정 시
- **방명록 스키마 확장** (새 필드, tombstone 도입 등) — 스키마 표 · 보안 규칙 `hasOnly` · UI 3 곳 동시 갱신 체크
- `invitation.config.ts` 의 `GuestbookConfig` / RSVP 관련 스키마 변경
- **"비밀번호 삭제" 전략을 MVP=C (delete 금지) 에서 A (Cloud Function) 또는 B (soft delete) 로 전환** 시 — "Firestore 보안 규칙" · "비밀번호 해싱" 섹션 전면 개정
