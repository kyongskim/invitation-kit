/**
 * 자정 기준 일수 차이. 시·분·초·타임존 변동에 휘둘리지 않고
 * 사용자 로컬 달력의 "오늘" 과 대상 날짜의 "그 날" 사이 일수를 반환.
 *
 * 0 = 같은 날, 양수 = 미래, 음수 = 과거
 */
export function daysUntil(target: Date | string): number {
  const t = typeof target === "string" ? new Date(target) : target;
  const now = new Date();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const targetMidnight = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round(
    (targetMidnight.getTime() - todayMidnight.getTime()) / 86_400_000,
  );
}
