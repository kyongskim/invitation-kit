import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
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

// App Check (ADR 009) — 봇 스팸·스크래핑 방어. ReCaptchaV3Provider + Console
// enforcement 토글 패턴. env var 누락 시 graceful skip — App Check 미사용
// 사용자 (셀프 호스팅 / 무료 티어 미설정) 도 그대로 동작.
//
// 운영자가 Firebase Console > App Check > Apps 에서 reCAPTCHA v3 등록 후
// site key 를 NEXT_PUBLIC_RECAPTCHA_SITE_KEY 로 .env.local + Vercel 양쪽에
// 추가하면 자동 활성. Firestore 차단은 Console 의 "Enforce" 토글로 별도 제어.
const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
if (typeof window !== "undefined" && recaptchaKey) {
  if (process.env.NODE_ENV === "development") {
    // Firebase Console 에서 발급한 debug token 으로 localhost 트래픽 우회
    // (reCAPTCHA 없이 통과). 운영자가 Console > App Check > Apps > 디버그
    // 토큰 관리에서 발급 + 본인 환경에 등록한 경우만 의미 있음.
    (
      self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // HMR 재평가로 중복 init 호출되거나 잘못된 site key 등. 운영 영향 없게
    // warn 만, 차단은 Console enforcement 가 담당.
    console.warn("[firebase] App Check init failed", err);
  }
}

export const db: Firestore = getFirestore(app);
