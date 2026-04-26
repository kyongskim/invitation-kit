#!/usr/bin/env node
/**
 * 카카오 Local API 로 invitation.config.ts 의 venue.address → coords 조회.
 *
 * 사용법:
 *   1. .env.local 에 KAKAO_REST_API_KEY=... 추가
 *      (Kakao Developer Console > 내 애플리케이션 > 앱 키 > REST API 키)
 *   2. npm run geocode
 *   3. 출력된 coords 를 invitation.config.ts 의 venue.coords 에 직접 paste
 *
 * 정책:
 * - print-only — TS source regex 자동 교체는 프래질해서 회피
 * - 카카오 Local API 무료 30만 호출/일 — 결혼식장 1회 검색이라 무한정 무료
 * - REST API 키는 NEXT_PUBLIC_ 없음 (CLI 전용, 클라이언트 노출 X)
 */

import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const text = readFileSync(".env.local", "utf-8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local 없으면 process.env 직접 사용 — CI / 다른 source 가능성
  }
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    console.error("\n❌ KAKAO_REST_API_KEY 환경 변수 누락\n");
    console.error("발급 절차:");
    console.error("  1. https://developers.kakao.com/console/app 접속");
    console.error("  2. 사용 중인 앱 선택 > 좌측 '앱 키' 메뉴");
    console.error("  3. 'REST API 키' 복사 (JavaScript 키와 별개)");
    console.error("  4. .env.local 에 추가:");
    console.error("     KAKAO_REST_API_KEY=발급받은_키\n");
    process.exit(1);
  }

  // invitation.config.ts 텍스트에서 venue.address 추출.
  // 정규식 한 번에 안전하게 — venue 블록 안의 address 라인 매치.
  let configText;
  try {
    configText = readFileSync("invitation.config.ts", "utf-8");
  } catch {
    console.error("❌ invitation.config.ts 를 찾지 못함");
    console.error("   레포 루트에서 npm run geocode 실행하세요\n");
    process.exit(1);
  }

  const match = configText.match(/venue:\s*\{[^}]*?address:\s*["'](.+?)["']/s);
  if (!match) {
    console.error("❌ invitation.config.ts 에서 venue.address 를 찾지 못함\n");
    process.exit(1);
  }

  const address = match[1];
  console.log("\n📍 카카오 Local API 로 좌표 조회 중...");
  console.log(`   주소: ${address}\n`);

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ Kakao API 응답 ${res.status}\n`);
    console.error(`   ${body}\n`);
    if (res.status === 401) {
      console.error(
        "   → REST API 키가 잘못됐거나 활성화 안 된 상태일 수 있음.",
      );
      console.error("   → Kakao Developer Console 에서 키 다시 확인.\n");
    }
    process.exit(1);
  }

  const data = await res.json();
  if (!data.documents || data.documents.length === 0) {
    console.error("❌ 좌표를 찾지 못함");
    console.error(
      "   → 주소를 더 정확히 (도로명 주소 + 건물 번호) 입력 후 재시도\n",
    );
    process.exit(1);
  }

  const first = data.documents[0];
  const lat = Number.parseFloat(first.y);
  const lng = Number.parseFloat(first.x);

  console.log("✓ 좌표 발견:");
  console.log(`   lat: ${lat}`);
  console.log(`   lng: ${lng}\n`);
  console.log("invitation.config.ts 의 venue.coords 를 다음으로 교체하세요:\n");
  console.log(`   coords: { lat: ${lat}, lng: ${lng} },\n`);

  if (data.documents.length > 1) {
    console.log(
      `(다른 후보 ${data.documents.length - 1} 건 — 첫 결과가 의도한 곳이 아니면 주소를 더 정확히)\n`,
    );
  }
}

main().catch((err) => {
  console.error("❌ 예상 못한 오류:", err);
  process.exit(1);
});
