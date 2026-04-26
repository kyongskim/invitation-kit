/**
 * v2.0 editor 의 config 직렬화. ADR 011 결정 4 (단일 TS 파일 전체 재생성).
 *
 * **server-only.** prettier 의존성 (~500KB+) 을 client bundle 에 넣지 않기
 * 위해 commit endpoint route handler (`app/api/github/commit/route.ts`,
 * 다음 호흡) 에서만 호출. client (editor UI) 가 직접 import 하면 prettier
 * 가 client bundle 에 따라 들어감.
 *
 * 출력: `invitation.config.ts` 의 전체 본문 문자열. GitHub Contents API
 * PUT 의 body 로 그대로 base64 인코딩하여 commit.
 *
 * 직렬화 의도:
 * - type 정의는 `invitation.config.types.ts` 에 별도 (이전 호흡에서 분리)
 * - 본문은 `import type` + `export type` re-export + `export const config`
 *   3 블록만. 사용자 추가 코멘트·import·헬퍼는 보존되지 않음 (editor
 *   모드의 트레이드오프, ADR 011 거부 대안 J 참조)
 * - prettier 마지막 패스로 quote 종류·trailing comma·indent 안정 → 사용자
 *   git diff noise 최소화
 */

import { format } from "prettier";

import type { InvitationConfig } from "@/invitation.config.types";

const HEADER = `// 이 파일은 v2.0 editor 가 생성·관리합니다.
// 수동 편집도 가능하나 editor 에서 다시 저장 시 덮어써집니다.
// editor 가 다루지 않는 schema 확장이 필요하면 v1.x 직접 편집 모드로.

import type { InvitationConfig } from "./invitation.config.types";

export type { InvitationConfig } from "./invitation.config.types";

export const config: InvitationConfig =`;

export async function serializeConfig(
  config: InvitationConfig,
): Promise<string> {
  const body = `${HEADER} ${JSON.stringify(config, null, 2)};\n`;
  return format(body, { parser: "typescript" });
}
