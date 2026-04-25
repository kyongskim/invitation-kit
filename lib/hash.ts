import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * 평문 비밀번호를 bcrypt 로 해싱한다. 결과 해시는 `$2a$10$...` 포맷의 60자.
 * 호출측에서 bcryptjs 를 직접 import 하지 않고 이 함수만 사용한다 — 알고리즘
 * 교체 (예: argon2) 시 한 곳만 바뀌도록.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * 평문 비밀번호와 저장된 해시를 비교. 일치 시 true, 불일치 시 false.
 *
 * 방명록 본인 삭제 검증에 사용. 클라이언트 환경에서 호출되는 도메인 적정 모델
 * (ADR 007 "C' 경로") — 청첩장 위협 모델 약함을 전제로 수용. 진짜 안전한
 * 검증 (서버 매개) 은 v1.1+ 후보.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
