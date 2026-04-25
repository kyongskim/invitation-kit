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
