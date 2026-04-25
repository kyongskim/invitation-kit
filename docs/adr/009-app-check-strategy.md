# ADR 009 — App Check 전략

- **Status**: Accepted (v1.1+ 호흡 5번째)
- **Date**: 2026-04-26
- **Context**: v1.1.0 release 직후. RSVP (`a280aeb` ADR 008) + 방명록 (8주차 도입 + ADR 007) 모두 Firestore write 가능 + read 공개 (방명록 한정) 라 봇 스팸·스크래핑 표면 노출. 외부 사용자 트래픽 0 인 상태에서도 도메인이 인터넷에 노출되면 봇이 자동 발견하므로 선제 방어가 정당.

## 결정 (Accepted)

**Firebase App Check 도입.** Provider 는 **`ReCaptchaV3Provider`** (무료 티어), 차단 enforcement 는 **Firebase Console 의 토글** 로 코드 외부에서 제어, env var (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`) 누락 시 init **graceful skip + console.warn** (App Check 미사용 사용자도 코드 그대로 동작). 로컬 dev 에선 `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` 활성 → Firebase Console 발급 debug token 으로 우회.

### 코드 진입점

```ts
// lib/firebase.ts
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

if (typeof window !== "undefined" && recaptchaKey) {
  if (process.env.NODE_ENV === "development") {
    // Firebase Console 의 App Check 디버그 토큰을 등록한 사용자 환경에서
    // localhost 트래픽이 reCAPTCHA 우회로 통과하게 한다.
    (
      self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
}
```

### 단계적 enforcement 운영

1. **도입 직후 (Monitoring)** — Firebase Console > App Check > Firestore > "Monitor" 모드. App Check 토큰 비율을 대시보드에서만 확인, 차단 X. 정상 사용자 token 통과율 > 95% 확인 후
2. **Enforce 전환** — 같은 화면의 "Enforce" 토글. App Check 토큰 없는 요청은 `permission-denied` 로 차단됨. 이때부터 `firestore.rules` 와 별개로 모든 Firestore 호출이 App Check 검증 통과 필요

코드 변경 없이 Console 토글로 운영 모드 전환되는 게 핵심. ADR 008 의 RSVP `read: false` 같은 정적 정책과 결의 다름 (rules 변경은 deploy 필요).

## 거부 대안

### A. ReCaptchaEnterpriseProvider

거부. **Google Cloud 결제 계정 연결 + Enterprise 요금** 발생. Free tier 1만 assessments/월 이후 $1/1000 assessment. OSS 템플릿이 비개발자 5분 배포 약속을 가지고 있어 결제 계정 연결 마찰은 정체성 위반. v3 의 무료 티어로 청첩장 도메인 (응답 ~수백건) 충분.

### B. firestore.rules 단 `request.auth.token.app_check` 검증

거부. rules 단 강제는 가능하지만 (`rules_version='2'` + `allow create: if request.auth.token.app_check`), 코드 변경 없이 Console 토글로 monitoring → enforce 전환 가능한 path 가 손실. **rules 변경은 deploy 사이클 필요** + monitoring 단계에서 false positive 비율 확인 못 한 채 즉시 강제 전환됨. App Check Console 토글이 의도된 enforcement 진입점.

### C. 항상 enforce 모드 (init 후 즉시 강제)

거부. **monitoring 단계 생략 시 false positive (정상 사용자 차단) 검증 기회 상실**. reCAPTCHA v3 은 score 기반 (0.0~1.0) 이라 사용자 환경 (VPN · Tor · 인앱 웹뷰 · 노트북 트랙패드 vs 모바일 등) 에 따라 score 흔들림. 정상 사용자가 0.5 미만으로 떨어지는 비율을 monitoring 으로 확인 필수. ADR 008 의 단계적 운영 (RSVP 도 8→12주차에 걸쳐 정책 진화) 패턴 일관.

### D. Play Integrity / DeviceCheck 도 함께 (Android·iOS native)

거부. **본 프로젝트는 웹 청첩장 only** — 네이티브 앱 시나리오 없음. reCAPTCHA v3 만으로 충분. 미래 v2.0 SaaS 분기 시 (모바일 앱 동반) 재검토.

### E. App Check 도입 안 함 (외부 트래픽 0 상태에서 불필요)

거부. **트래픽 0 ≠ 봇 트래픽 0**. 도메인이 인터넷 (Vercel `*.vercel.app`) 에 노출되면 봇이 자동 발견하고 시도. RSVP `read: false` + 방명록 `read: true` 차이 무관 — write 표면이 둘 다 열려있음. 선제 방어 ROI 큼 + 비용 0 (v3 무료).

## 청첩장 도메인 적정 맥락

본 결정은 **결혼식 1회 + 응답 풀 ~100명 + 위협 모델 약함** 가정 그대로. App Check 의 v3 무료 티어 한도 (10K assessments/월) 안에 충분히 들어감. Enterprise 가 필요해지는 시점은 다른 도메인 fork (커뮤니티 / 컨퍼런스 RSVP) 인데 그땐 ADR 008 이 부적합 명시한 것과 같은 맥락 — 다른 도메인 fork 시 결제 계정 연결도 트레이드오프 재계산 필요.

## 미래 트리거 (재검토 조건)

1. **정상 사용자 false positive 사례 보고** — 노년층 / VPN / 일부 인앱 웹뷰 사용자 score < 0.5. `firestore.rules` 에 score threshold 완화 또는 challenge fallback 도입 검토
2. **App Check 도입 후에도 vandalism 지속** — bot 이 reCAPTCHA v3 을 우회한 경우. Enterprise 또는 reCAPTCHA challenge (v2 invisible) 추가
3. **모바일 네이티브 앱 동반** — Play Integrity / DeviceCheck 추가 (대안 D)
4. **무료 티어 한도 초과** — 1만 assessments/월 넘기는 트래픽 (현 도메인 적정 가정 깨짐)

## 관련

- ADR 007 (방명록 본인 삭제 C') · ADR 008 (RSVP) — Firestore 표면 노출의 선례
- `.claude/rules/firebase.md` Scope 섹션 — App Check 가 본 ADR 로 적용 범위 안으로 들어옴
- `docs/api-keys.md` — 사용자 직접 Console 작업 절차
- `docs/00-roadmap.md:303` — v1.1 1순위 후보 App Check 항목
