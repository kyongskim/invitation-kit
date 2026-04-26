import { config } from "@/invitation.config";

const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * 결혼식 달의 달력을 렌더링하는 정적 섹션.
 * `config.date` 에서 year/month/day 자동 유도 — 사용자 config 수정 0.
 *
 * 7×N 그리드:
 * - 일요일 시작 (한국 표준)
 * - 결혼식 날 셀에 `--color-primary` 원 강조
 * - 다른 달 날짜는 흐림 처리 (그리드 정렬용 보충)
 *
 * Server Component — 클라이언트 hydration 불필요. `config.date` 는
 * ISO 8601 + 타임존이라 빌드 시점에 모두 결정됨.
 */
export function CalendarMonth() {
  const wedding = new Date(config.date);
  const year = wedding.getFullYear();
  const month = wedding.getMonth(); // 0-indexed
  const weddingDay = wedding.getDate();

  // 그리드 시작·끝 계산. 시작은 해당 월 1일이 속한 주의 일요일,
  // 끝은 해당 월 마지막 날이 속한 주의 토요일.
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const gridEnd = new Date(year, month + 1, 6 - lastOfMonth.getDay());

  // 그리드 셀 배열 생성
  const cells: { date: number; inMonth: boolean; isWedding: boolean }[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const inMonth = cursor.getMonth() === month;
    cells.push({
      date: cursor.getDate(),
      inMonth,
      isWedding: inMonth && cursor.getDate() === weddingDay,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weekdayLabel = KOREAN_WEEKDAYS[wedding.getDay()];
  const hour = wedding.getHours();
  const minute = wedding.getMinutes();
  const timeLabel = `${hour}:${String(minute).padStart(2, "0")}`;

  return (
    <section className="flex flex-col items-center px-6 py-24">
      <div className="animate-fade-in-up flex w-full max-w-md flex-col items-center text-center">
        <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
          The Date
        </p>
        <h2 className="text-primary mt-6 font-serif text-3xl font-light">
          {year}년 {month + 1}월
        </h2>

        <div className="mt-10 grid w-full grid-cols-7 gap-y-3 text-sm">
          {KOREAN_WEEKDAYS.map((label) => (
            <span
              key={label}
              className="text-secondary text-xs font-medium tracking-wider"
            >
              {label}
            </span>
          ))}
          {cells.map((cell, idx) => (
            <span
              key={idx}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                cell.isWedding
                  ? "bg-primary text-white"
                  : cell.inMonth
                    ? "text-text"
                    : "text-secondary/30"
              }`}
            >
              {cell.date}
            </span>
          ))}
        </div>

        <p className="text-secondary mt-10 text-sm tracking-wider">
          {year}년 {month + 1}월 {weddingDay}일 {weekdayLabel} {timeLabel}
        </p>
      </div>
    </section>
  );
}
