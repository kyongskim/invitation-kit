# ADR 007 · 방명록 본인 삭제·수정 — 클라이언트 검증 + 도메인 적정 모델 채택

- 상태: Accepted
- 날짜: 2026-04-25 (12주차 Day 1, 삭제 도입), **2026-04-26 (수정 확장 — v1.1+ 호흡)**
- 관련: `.claude/rules/firebase.md` (삭제 전략 섹션), `firestore.rules`, `lib/hash.ts`, `components/sections/guestbook/`, `docs/blog-posts/2026-04-25-12week-retrospective.md`

---

## 2026-04-26 갱신 — 본인 수정 확장

본 ADR 의 C' 경로 (클라이언트 verifyPassword + Firestore rule allow) 를 **delete 외에 update 까지 확장**. 패턴 동일:

- 클라이언트가 verifyPassword 후 일치 시에만 `updateDoc` 호출
- `firestore.rules` 의 `allow update: if <validation>` 에서 `passwordHash` · `createdAt` 잠금 (서버 측 위변조 차단)
- name · message 필드만 변경 허용 (1~20자 / 1~500자)

거부 대안 1 종 (E. update 미지원, 다시 작성 + 운영자 dedup) — UX 손해 (실명 한 번 박힌 상태에서 오타 수정도 새 글로 처리해야) + delete 와 결의 비대칭. C' 경로 자체가 이미 클라이언트 검증 우회 가능성을 도메인 적정 트레이드오프로 수용했으므로 update 도 같은 모델 일관 적용이 자연스러움.

DevTools 우회 가능성 동일 — vandalism 시나리오에서 update 가 delete 보다 더 위험할 수 있음 (악성 메시지로 교체). 단, **본인 message 만 갈아끼울 수 있고 다른 사람 message 는 firestore rule 의 passwordHash 잠금으로 password 알아야 함** (즉 다른 사람 글을 자기 글로 위변조 못함, 다만 자기 글 변경은 password 알면 자유). 이는 delete 와 동일한 위협 모델.

---

## 맥락 (Context)

8주차 방명록 출시 시점, 삭제 전략은 ADR 없이 `.claude/rules/firebase.md` "삭제 전략 — 왜 `allow delete: if false;` 인가" 섹션에만 박혀있었다. 결정 자체는 명확했지만 — **C 경로 (delete 금지 + 운영자 안내)** — ADR 격상 없이 규칙 파일에만 남긴 결정이라 12주차 재논의 시점에 추적성이 떨어졌다.

11주차 외부 공개·홍보 호흡을 본 프로젝트 스코프에서 제외하기로 결정한 직후, 사용자가 12주차 보완 호흡 진입 시점에 다음을 제기했다:

> 비밀번호 입력해서 일치하면 삭제하도록 하는거 구현해야될 것 같아. 다른 모바일청첩장에 그런거 구현되어 있더라고.

이 제기는 **8주차 결정 (C 경로) 의 재검토 트리거**다. v1.0 의 솔직 약점 ("비밀번호 입력은 받지만 검증 경로 없음") 을 12주차 호흡 안에서 closure 하자는 의도. 이 ADR 은 그 재검토의 결과를 명시 기록한다.

### 8주차 시점의 분석 회고

ADR 없이 firebase.md 에만 박혔던 8주차 결정 근거는 다음과 같았다:

- **A. Cloud Function 프록시** — 안전. Cloud Functions 가 firebase.md 의 영구 스코프 밖으로 명시 → MVP 밖 → 거부
- **B. Soft delete (update tombstone)** — "본인만 tombstone 가능" 을 Firestore rules 로 증명할 수 없음 → vandalism 가능 → 거부
- **C. Delete 금지 + 운영자 안내** — MVP 채택

8주차의 거부 핵심 = "Firestore 보안 규칙 단에서 비밀번호 평문 검증 자체가 원천 불가능". rules 는 `request.resource.data` 와 `resource.data` 만 보고, bcrypt 비교 함수도 없음. 즉 안전한 검증은 서버 매개 (A 또는 A 변형) 가 유일.

이 분석 자체는 12주차에도 유효하다. 변한 것은 **트레이드오프 평가**.

## 검토한 대안

### A. 클라이언트 bcrypt 검증 + `allow delete: if true;` (채택, "C' 경로")

```ts
// 클라이언트
const ok = await bcrypt.compare(inputPassword, doc.passwordHash);
if (ok) await deleteDoc(docRef);
```

```
// firestore.rules
allow delete: if true;
```

- **장점**:
  - 분량 1 호흡 — 기존 `passwordHash` 저장 인프라 그대로 활용. v0.2 부터 운영 중인 글들도 즉시 본인 삭제 가능
  - 무료 티어 (Firebase Spark + Vercel Hobby) 유지 — 비개발자 5분 배포 약속 보존
  - 비개발자 setup 추가 0 — fork 사용자가 새로 학습할 단계 없음
  - 일반 모바일 청첩장 관행과 일치 — 외부 사용자에겐 자연스러운 UX
- **단점**:
  - **클라이언트 검증 우회 가능** — DevTools Console 에서 `deleteDoc(doc(db, "guestbook", "xxx"))` 1줄로 비밀번호 없이 삭제 가능
  - rules 가 누구든 delete 허용이라 실질 보호막은 클라이언트 검증뿐
- **단점 평가 (도메인 적정성)**:
  - 청첩장 도메인 위협 모델 = 거의 0. 가족·지인 사이의 의도적 vandalism 가능성 매우 낮음
  - 작성자 풀 = single-digit 또는 ~100명. 공격자 모집 자체가 비현실
  - 공격 성공 시 손해 = "글 1개 삭제" — 운영자가 Firestore Console 또는 Console export 백업으로 복구 가능
  - **OSS 템플릿 우려**: 다른 도메인 (커뮤니티 게시판, 댓글 시스템 등) 으로 fork 시 같은 패턴이 진짜 공격자 환경에서 깨짐 → 본 ADR + firebase.md + README 에 "보안 모델 한계 — 청첩장 도메인 적정, 다른 도메인엔 부적합" 명시로 회피

### B. Vercel Route Handler + Firebase Admin SDK (거부)

`app/api/guestbook/[id]/route.ts` 의 DELETE handler 가 service account 권한으로 bcrypt 비교 후 admin 권한으로 삭제.

- **장점**: 안전 100%. 클라이언트 우회 불가
- **거부 근거**:
  1. **firebase.md 영구 스코프 위반** — "Admin SDK / Service Account — 영구 범위 밖" 명시. 정책 폐기 결정 필요
  2. **비개발자 setup 부담** — fork 사용자가 Firebase 콘솔에서 service account 발급 → JSON 파일 다운로드 → Vercel 환경 변수에 다중 줄 JSON 등록. 기존 6 키 외 추가. 비개발자 5분 배포 약속과 충돌
  3. **Edge Runtime 비호환** — `firebase-admin` 은 Node.js runtime 필요. Vercel Hobby 의 Function 콜드 스타트 ~1초
  4. **분량 2 호흡 이상** — Route Handler + Admin SDK 초기화 + service account 가이드 페이지 + 환경변수 등록 + ADR. v1.0 의 OSS 템플릿 정체성 갱신과 묶어서 한 번에
  5. **트레이드오프 비대칭** — "안전 100%" 의 가치가 청첩장 도메인 위협 모델 (거의 0) 대비 부가가치 미미. 신규 기여자 진입 장벽만 상승
- **단점 평가**: B 는 진짜 안전하지만 청첩장 도메인엔 over-engineering. **v1.1+ 후보** 로 명시 보류 — 실사용자 (다른 커플) 가 vandalism 사례 보고 시 또는 RSVP / 댓글로 작성자 풀이 1 청첩장당 100 명+ 로 늘어날 때 재검토

### C. Cloud Function (거부)

callable function (`httpsCallable`) 으로 Admin 권한 비교·삭제.

- **거부 근거**:
  1. **Spark 플랜 제한** — Cloud Functions for Firebase 는 2024-10 이후 Spark 에서도 제한적 사용 가능하나 outbound networking 제한이 있고, 본 시점 (2026-04) 의 정확한 정책 검증 비용 발생. **사용자가 카드 등록 (Blaze 플랜)** 단계가 한국 비개발자에겐 큰 마찰
  2. **별도 배포 단계** — `firebase deploy --only functions` + Functions 디렉토리 + package.json. v1.0 의 lib-only 자체 구현 정체성과 어긋남
  3. **B 와 비교 시 Vercel 일관성 손실** — 호스팅은 Vercel 인데 함수는 Firebase 라는 분산 책임. B 의 Route Handler 가 우리 스택에 더 정합
- **단점 평가**: B 와 비교한 결과 B 가 더 자연. C 는 v1.1+ 후보로도 우선순위 낮음

### D. Soft delete + tombstone (거부, 8주차 결정 재확인)

`deletedAt` 필드 update 만 허용. UI 에서 tombstone 글 숨김 처리.

- **거부 근거 (8주차 동일)**: rules 단에서 "본인만 tombstone 가능" 검증 불가. 누구나 임의 글의 `deletedAt` 설정 가능 → vandalism 의 변형. A (클라이언트 hash 검증 + delete) 와 보안 동등하면서 구현은 더 복잡 (UI 의 tombstone 필터링, "삭제된 메시지" 카피, 미래 hard delete 정리 정책). **A 가 동등 보안에 더 단순**
- 12주차에도 거부 유지

### E. 비밀번호 입력 자체 빼기 + 운영자 수동 삭제 유지 (거부)

`Guestbook` 폼에서 비밀번호 입력 제거, `passwordHash` 스키마·rules 검증 제거, "삭제는 신랑·신부에게 문의" 안내 유지.

- **장점**: 가장 정직. v1.0 의 "받지만 검증 안 함" 어색함 즉시 closure
- **거부 근거**:
  1. **사용자 의도 반영 X** — 12주차 재검토 트리거가 "본인 삭제 도입" 이지 "약점 인정 후 후퇴" 가 아님
  2. **일반 모바일 청첩장 관행 미충족** — 외부 사용자 fork 시 "본인 삭제" 가 빠진 청첩장은 채택 동기 약화
  3. **A 가 가능한 시점에 E 선택할 명분 약함** — 도메인 적정 위협 모델이 A 를 충분히 정당화

## 결정 (Decision)

**A 채택 (C' 경로)**. 이름은 8주차 firebase.md 의 "C 경로" 와 구분하기 위해 "C' (C-prime)" 으로 부른다 — 같은 클라이언트 책임 모델인데 delete 자체를 허용한다는 차이.

### 1. `lib/hash.ts` — `verifyPassword` 추가

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

`bcrypt.compare` 는 timing-safe — 일치/불일치 시간 차이 없음. 클라이언트 검증이라 timing attack 자체는 위협 모델 밖이지만 라이브러리 기본값을 활용.

### 2. `firestore.rules` — `allow delete: if true;`

```
match /guestbook/{id} {
  allow read: if true;
  allow create: if /* 기존 검증 동일 */;
  allow update: if false;
  allow delete: if true;  // C' 경로 — 클라이언트 검증 책임. 도메인 적정 트레이드오프
}
```

`update` 는 여전히 `false` — soft delete 거부 결정 일관성. 글 수정 기능도 v1.1+ 후보.

### 3. UI — `GuestbookList` 에 글마다 "삭제" 텍스트 링크 + 비밀번호 모달

- 글 카드 우하단에 작은 "삭제" 텍스트 링크 (`text-secondary text-xs underline-offset-4 underline`)
- 클릭 시 신규 컴포넌트 `DeleteConfirmModal` 마운트 (Lightbox 패턴 일관 — `AnimatePresence` 조건부 마운트, body scroll lock, Escape close, backdrop click close)
- 모달 내용: "이 메시지를 삭제하시겠어요?" + 비밀번호 input + "취소" / "삭제" 버튼
- 비밀번호 불일치 시 inline 에러 (`text-red-600 text-xs`)
- 삭제 성공 시 모달 닫히고 토스트 "메시지가 삭제되었습니다", optimistic UI 로 entries 에서 즉시 제거
- 운영자 안내 한 줄은 **유지** ("비밀번호 잊으셨나요? 신랑·신부에게 문의" 로 카피 변형) — 비밀번호 분실 시 fallback

### 4. `Guestbook.tsx` orchestrator — `handleDelete`

```ts
const handleDelete = async (id: string, password: string) => {
  const docRef = doc(db, COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("not found");
  const hash = snap.data().passwordHash as string;
  const ok = await verifyPassword(password, hash);
  if (!ok) throw new Error("password mismatch");
  await deleteDoc(docRef);
  setEntries((prev) => prev.filter((e) => e.id !== id));
  showToast("메시지가 삭제되었습니다");
};
```

에러는 모달 안에서 catch — orchestrator 가 throw 하면 모달이 inline 에러 표시.

### 5. `firebase.md` 의 "삭제 전략" 섹션 갱신

기존 "C 채택" 절을 "C' 채택" 으로 다시 씀. 거부 대안 (A 서버 매개) 의 v1.1+ 후보 명시 + 보안 모델 한계 1 절 추가.

### 6. 도메인 적정 모델 명시 (OSS 템플릿 정체성 보호)

다음 위치에 "본 보안 모델은 청첩장 도메인의 트레이드오프, 다른 도메인 fork 시 부적합" 명시:

- `firebase.md` 의 "삭제 전략" 섹션 — 1차 위치
- 본 ADR 007 의 "결과 (Consequences)" 섹션 — 결정 기록
- (선택) `CONTRIBUTING.md` 또는 `README.md` — 외부 fork 사용자 대상 첫 노출. 본 호흡 후속 또는 별도 호흡

## 결과 (Consequences)

### 긍정

- **솔직 약점 closure** — v1.0 의 "비밀번호 받지만 검증 안 함" 어색함을 12주차 안에서 정합 closure. velog 글 8주차 절도 한 줄 갱신
- **분량 1 호흡** — 비개발자 5분 배포 약속 보존
- **일반 청첩장 UX 충족** — 외부 fork 사용자 채택 장벽 낮춤
- **결정 추적성 개선** — 8주차 firebase.md 한정이던 결정이 ADR 격상 → 미래 재검토 시 명시 참조점

### 부정 / 주의

- **클라이언트 검증 우회 가능 (의도된 트레이드오프)** — DevTools 1줄로 비밀번호 없이 삭제 가능. 청첩장 도메인 위협 모델 약함을 전제로 수용. **OSS 사용자가 다른 도메인 (커뮤니티 게시판 등) 으로 fork 시 부적합** — README 또는 CONTRIBUTING 에 명시 권장
- **운영자 vandalism 복구 의무** — 글 삭제는 Firestore 에서 hard delete. 사고 시 복구 = Firestore Console 의 export 백업이 유일. 운영자에게 "주기적 Console export 권장" 안내 필요 (firebase.md 에 추가)
- **rules 의 `allow delete: if true;` 가 다른 컬렉션 추가 시 위험 패턴 복제 트리거 가능성** — `guestbook/{id}` 경로 한정 명시 + RSVP / 댓글 추가 시 별도 결정 (이 ADR 의 일반화 금지)

### 미래 트리거 — v1.1+ 재검토 조건

다음 중 하나 충족 시 본 ADR 재검토 → B (Vercel Route Handler) 채택:

- 실사용자 (다른 커플) 가 자체 운영 중 vandalism 사례 보고 (1건이라도)
- 작성자 풀이 1 청첩장당 100 명+ 로 늘어남 (RSVP / 댓글 도입 시 자연 발생)
- "다른 도메인 fork 후 vandalism 발생" 사례 보고 — 같은 패턴 복제의 위험 실증

## 참고

- `.claude/rules/firebase.md` — 삭제 전략 섹션 (본 ADR 으로 링크 추가, 내용 C → C' 전환)
- `firestore.rules` — `allow delete: if true;` 변경 위치
- `lib/hash.ts` — `verifyPassword` 추가 위치
- `components/sections/guestbook/` — UI 변경 위치
- `docs/blog-posts/2026-04-25-12week-retrospective.md` — 8주차 절 한 줄 갱신
- ADR 006 — 욕설 필터 강화 결정 패턴 미러 (코드 변경 + 결정 기록 분리 커밋)
- 8주차 firebase.md — 본 ADR 이 격상 대상으로 삼은 원 결정 위치
