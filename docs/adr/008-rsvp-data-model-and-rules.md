# ADR 008 — RSVP 데이터 모델 + 보안 규칙

- **Status**: Accepted (v1.1+ 호흡 3번째)
- **Date**: 2026-04-25
- **Context**: 12주차 closure 의 v1.1 1순위 후보 7개 중 큰 신기능 1개. 본인 결혼식 D-22 일 시점 실사용 ROI 최대 + 방명록(`guestbook`) 의 Firestore 인프라 그대로 재활용.

## 결정 (Accepted)

`rsvp/{autoId}` Firestore 컬렉션을 신규 도입한다. 스키마는 **5 필드** (`name` · `attendance` · `side` · `companions` · `message`) + `createdAt` (`serverTimestamp()`). 보안 규칙은 `read: if false` (host 만 Firebase Console 에서 조회) + `create: if hasOnly([...]) + 길이/타입 검증` + `update/delete: if false` (편집·취소 미지원, 다시 제출하면 host 책임으로 dedup). 마감일은 `config.rsvp.deadline` (ISO 8601) 으로 클라이언트 단 form disable 처리.

### 스키마

| 필드         | 타입                 | 필수 | 제약                     |
| ------------ | -------------------- | ---- | ------------------------ |
| `name`       | `string`             | ✓    | 1~20자                   |
| `attendance` | `'yes' \| 'no'`      | ✓    | 정확히 두 값 중 하나     |
| `side`       | `'groom' \| 'bride'` | ✓    | 정확히 두 값 중 하나     |
| `companions` | `number`             | ✓    | 0~5 정수 (본인 제외)     |
| `message`    | `string`             | ✓    | 0~200자 (빈 문자열 허용) |
| `createdAt`  | `Timestamp`          | ✓    | `serverTimestamp()`      |

`companions` · `message` 가 선택 표시 필드라도 **Firestore 페이로드에는 항상 포함**한다 (빈 문자열 / `0`). 보안 규칙 `hasOnly([...])` 는 정확 일치만 통과시키므로 optional 필드를 허용하면 검증이 약해짐. UI 레벨에서만 `config.rsvp.fields` 토글로 입력란을 숨기고, 페이로드는 기본값으로 채운다.

### 보안 규칙

```
match /rsvp/{id} {
  allow read: if false;
  allow create: if
    request.resource.data.keys().hasOnly(['name', 'attendance', 'side', 'companions', 'message', 'createdAt'])
    && request.resource.data.name is string
    && request.resource.data.name.size() >= 1
    && request.resource.data.name.size() <= 20
    && request.resource.data.attendance in ['yes', 'no']
    && request.resource.data.side in ['groom', 'bride']
    && request.resource.data.companions is int
    && request.resource.data.companions >= 0
    && request.resource.data.companions <= 5
    && request.resource.data.message is string
    && request.resource.data.message.size() <= 200
    && request.resource.data.createdAt == request.time;
  allow update, delete: if false;
}
```

방명록 (`guestbook`) 은 `read: if true` (실명 일상 메시지 공개 전제) 였지만 RSVP 는 사적 정보 (참석/불참 + 동반 인원 + 메시지) 라 의도적으로 차단. host (신랑/신부) 는 Firebase Console 의 Firestore 데이터 탭에서 직접 조회.

## 거부 대안

### A. read 도 공개 (`allow read: if true`)

거부. RSVP 는 "누가 안 오는지" 가 노출되면 사회적 부담이 크다. 방명록처럼 read 공개하면 다른 하객이 참석 명단을 스크롤하다 본인 부재가 보이는 시나리오 → privacy violation. 청첩장 도메인의 사회적 맥락 (참석 = 정상, 불참 = 사정이 있는) 때문에 read 막는 게 정공법.

### B. 비밀번호 기반 본인 편집/취소 (방명록 ADR 007 패턴 재사용)

거부. 방명록은 "잘못 쓴 메시지를 본인이 지운다" 가 일반 use case 라 비밀번호 패턴이 의미 있었지만, RSVP 는 "참석 결정을 바꿈" 이 드물고 (2~3 주 안에 결혼식이 끝남 + 결정이 갑자기 바뀌는 경우 직접 신랑/신부에게 연락하는 게 한국 결혼식 관행), 비밀번호 입력 폼이 추가되면 form 길이 + 비개발자 사용성 부담만 증가. **편집은 다시 제출** + **중복은 host 책임으로 dedup** 가 더 단순한 균형.

### C. host 조회용 별도 admin 페이지

거부. v1 에서는 Firebase Console 직접 조회로 충분 — 결혼식 1회 use case + 응답 ~100건 규모라 Console table view 가 자연스러움. admin 페이지는 (1) 인증 (Firebase Auth) 도입 (2) 권한 분기 (3) UI 작성 비용 (4) Vercel 배포 분리 모두 필요해 v1.1+ 이상 큰 호흡. **트리거 조건: 응답 100건+ 또는 host 가 모바일에서 빠른 확인 원할 때.**

### D. 식사 / 아동 인원 / 연락처 추가

v1 에서 거부. **MVP 5 필드로 단순화**. 추가 필드는 운영 데이터 누적 후 (실제 결혼식 운영자 피드백) 점진 도입. v1.2+ 후보:

- **식사 (한/양식)** — 결혼식장 사전 인원 보고에 도움. 단, 한국 결혼식은 보통 결혼식장이 자체 메뉴라 RSVP 단계에서 받지 않음
- **아동 인원** — 식대 차이 (성인 7만 / 아동 3만) 운영자가 더 정확히 잡고 싶을 때
- **연락처** — 변경 안내 시 host 쪽에서 push 보낼 수 있음. 단, 개인정보보호법 준수 부담 추가 (수집 동의 명시 필요)

### E. 마감일 미도입 (항상 활성)

거부. 결혼식 식대 사전 보고는 보통 **D-7 ~ D-3 일 마감**. 마감일 없이 결혼식 당일까지 RSVP 받으면 host 가 식대 인원 잘못 신고 + 운영자 페널티 가능. `config.rsvp.deadline` ISO 8601 + 마감 후 form disable + "RSVP 는 마감되었습니다" 안내가 적정.

### F. update/delete 허용 (편집/취소)

거부. update 허용 시 본인 검증을 어떻게 하느냐가 ADR 007 의 청첩장 도메인 트레이드오프와 동일한 문제로 회귀. **다시 제출 + host 책임 dedup** 로 단순화. host 가 같은 이름이 두 번 나타나면 마지막 createdAt 기준으로 처리 (Firebase Console 에서 수동).

## 청첩장 도메인 적정 맥락

본 RSVP 모델은 **한국 결혼식 1회 사용** + **응답 풀 ~100명 이내** + **위협 모델 약함 (vandalism 거의 없음)** 가정. 다른 도메인 (이벤트 RSVP 시스템, 컨퍼런스 등록 등) 으로 fork 시 부적합 — 결제 / 인증 / 다회 사용 / 대량 응답이 들어오면 본 모델은 깨진다. OSS 템플릿 정체성 보호 차원에서 README/CONTRIBUTING 에 명시.

## 의사결정 메타

ADR 007 (방명록 본인 삭제) 의 "도메인 적정" 패턴을 RSVP 에도 적용 — 본인 검증 / 편집 / 취소 / 인증 / read 공개 모든 결정에서 "결혼식 1회 도메인 + ~100명 풀 + 위협 모델 약함" 을 일관 기준으로 가져감. ADR 005 (다중 테마) 처럼 거부 대안 6 개 (A~F) 명시 → "왜 단순한가" 의 견고성 확보.

## 미래 트리거 (재검토 조건)

다음 조건 중 하나가 발생하면 본 ADR 재검토:

1. **vandalism 사례 보고** — 누군가 더미 데이터를 대량 submit. → 도메인 적정 가정 깨짐, App Check 동시 도입 필요
2. **응답 100건+** — host 가 Console 단순 조회로 처리 어려워짐. → admin 페이지 (대안 C) 트리거
3. **운영자 페널티 사례** — 마감일 후에도 응답이 들어와 식대 보고에 영향. → 마감일 강화 (서버 단 검증) 또는 운영자 알림 자동화
4. **식사/아동 인원 추가 요구** (실 사용자 운영자 피드백) — 대안 D 의 점진 도입 트리거

## 관련

- ADR 007 (방명록 본인 삭제 C' 경로) — 도메인 적정 트레이드오프 패턴의 원형
- `.claude/rules/firebase.md` — Scope 섹션의 RSVP 가 본 ADR 로 구체화
- `docs/00-roadmap.md:299-307` — v1.1 1순위 후보 7 종 중 RSVP 항목
