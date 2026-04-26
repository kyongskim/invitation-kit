import type { NextRequest } from "next/server";

/**
 * 카카오 Local API (장소 키워드 검색) proxy.
 *
 * 왜 server route — `KAKAO_REST_API_KEY` 는 서버 전용 (CORS 차단 + 클라
 * 노출 금지). client 가 직접 dapi.kakao.com 호출 불가. server route 가
 * 키 보유 + 응답을 정제된 JSON 으로 client 에 전달.
 *
 * editor 의 VenueForm 이 사용. 사용자가 예식장 이름 검색 → 결과 클릭 →
 * name + address + coords 자동 채움. 비개발자가 좌표를 외부 도구로 찾는
 * 마찰 (geocode CLI 또는 카카오맵 좌표 복사) 제거.
 *
 * 키 정책: scripts/geocode.mjs 와 동일 키 재사용 — 추가 setup 0 건.
 * 무료 30만 호출/일 한도 (한 사용자가 검색 ~10 회 수준이라 사실상 무한정).
 */

export const runtime = "nodejs";

const KAKAO_ENDPOINT = "https://dapi.kakao.com/v2/local/search/keyword.json";

export type SearchPlace = {
  name: string;
  address: string;
  coords: { lat: number; lng: number };
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json(
      { error: "쿼리 파라미터 q 가 필요합니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "KAKAO_REST_API_KEY 환경변수 미설정. 검색 자동화는 비활성 — 주소·좌표를 직접 입력하세요.",
      },
      { status: 503 },
    );
  }

  let documents: KakaoDocument[];
  try {
    const res = await fetch(
      `${KAKAO_ENDPOINT}?query=${encodeURIComponent(query)}&size=10`,
      {
        headers: { Authorization: `KakaoAK ${apiKey}` },
      },
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { documents?: KakaoDocument[] };
    documents = data.documents ?? [];
  } catch (err) {
    return Response.json(
      {
        error: `카카오 검색 실패: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }

  const places: SearchPlace[] = documents.map((doc) => ({
    name: doc.place_name,
    address:
      doc.road_address_name && doc.road_address_name.length > 0
        ? doc.road_address_name
        : doc.address_name,
    coords: {
      lat: Number.parseFloat(doc.y),
      lng: Number.parseFloat(doc.x),
    },
  }));

  return Response.json({ places });
}

type KakaoDocument = {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
};
