# 1주차 실행 가이드 — 일자별 To-Do

> **목표:** 1주차 끝에 프로젝트 기획이 확정되고, GitHub 저장소에 README가 올라가 있는 상태

각 날짜는 평일 기준 1~2시간, 주말은 2~3시간을 가정했어요. 본인 페이스에 맞게 조정하세요.

---

## Day 1 (월) · 이름 확정 + GitHub 레포 생성 [30분]

- [ ] `docs/01-project-brief.md`의 이름 후보 중 최종 선택
- [ ] GitHub 새 레포 생성
  - Repository name: 선택한 이름 (예: `invitation-kit`)
  - Description: `한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿 · Config-driven Korean mobile wedding invitation template`
  - Public, README 체크 해제, .gitignore `Node`, License `MIT`
- [ ] Topics 추가: `wedding`, `invitation`, `korean`, `nextjs`, `tailwindcss`, `template`, `mobile`

## Day 2 (화) · 기능 명세 리뷰 + 디자인 방향 잡기 [1~2시간]

- [ ] `docs/01-project-brief.md` 다시 읽고 Must 기능에서 빠진 게 없는지 점검
- [ ] 디자인 레퍼런스 수집 (Pinterest 보드 하나 만들기 추천)
  - 검색 키워드: `wedding invitation mobile`, `minimal wedding card`, `korean wedding invitation`
  - 각 테마당 3~5장씩 저장 (모던/클래식/플로럴/미니멀/빈티지)
- [ ] 경쟁 레포 3개 직접 데모 열어보고 스크린샷 수집
  - [wzulfikar/nextjs-wedding-invite](https://github.com/wzulfikar/nextjs-wedding-invite)
  - [immutable.wedding](https://immutable.wedding)
  - 국내 대표 상용 서비스 (청첩장청첩장, 바른손, 더카드) 2~3개

## Day 3 (수) · README 초안 커밋 [1시간]

- [ ] 로컬 머신에 clone
  ```bash
  git clone https://github.com/본인계정/invitation-kit.git
  cd invitation-kit
  ```
- [ ] `README.md`, `README.en.md` 파일을 프로젝트에 복사 (이번 대화에서 만든 파일)
- [ ] 데모 링크(`#`)를 일단 `TBD`로 남겨두기
- [ ] 커밋: `docs: add initial README (ko/en)`
- [ ] push 후 GitHub 웹에서 README가 잘 렌더링되는지 확인

## Day 4 (목) · Config 스키마 확정 + ADR 기록 [1~2시간]

- [ ] `invitation.config.ts` 파일을 프로젝트에 복사
- [ ] 본인 정보로 한 번 채워보면서 불편한 지점 메모
  - "이 필드가 선택인지 필수인지 헷갈린다" → optional 표시 보강
  - "이미지 width/height를 매번 재야 하나?" → 자동 감지 스크립트 아이디어로 메모
- [ ] `docs/adr/` 디렉토리 만들고 의사결정 기록 (ADR = Architecture Decision Record)
  - `001-use-nextjs-app-router.md`
  - `002-config-driven-approach.md`
  - 각 1페이지, "맥락 / 결정 / 결과" 포맷
- [ ] 커밋: `chore: add config schema and ADRs`

## Day 5 (금) · 디자인 스케치 [2시간]

- [ ] Figma 또는 종이에 메인 페이지 와이어프레임 그리기
  - 섹션 순서 결정: Main → 인사말 → 갤러리 → 예식 정보 → 오시는 길 → 방명록 → 계좌 → 공유
  - 각 섹션의 대략적 세로 높이
- [ ] 첫 테마('modern')의 컬러 팔레트 3종 고르기
  - 메인 컬러, 서브 컬러, 배경 컬러
  - [Coolors.co](https://coolors.co)에서 팔레트 저장
- [ ] 폰트 후보 2~3개 (Pretendard 거의 확정, 본문/장식용 영문 폰트 결정)

## Day 6 (토) · 이슈 템플릿 + 프로젝트 보드 셋업 [1시간]

- [ ] `.github/ISSUE_TEMPLATE/` 안에 bug.md, feature_request.md 작성
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` 작성
- [ ] GitHub Projects로 보드 생성 (Kanban)
  - 컬럼: Backlog / This Week / In Progress / Review / Done
  - 2주차 예정 태스크 카드 5개 미리 등록
- [ ] 첫 번째 Issue 생성: "v0.1.0 MVP 마일스톤" — Must 기능들을 체크리스트로 넣기

## Day 7 (일) · 회고 + 2주차 준비 [30분]

- [ ] 1주차에서 뭐가 잘 됐고 뭐가 막혔는지 메모 (`docs/retrospective/week-01.md`)
- [ ] 2주차 계획 확인: Next.js 15 초기화 + Tailwind + CI/CD
- [ ] 다음 주 개발 시간 블록 캘린더에 미리 잡기

---

## ⚠️ 1주차에서 흔히 빠지는 함정

1. **"디자인부터 완벽하게 하자"** — NO. 1주차는 텍스트 문서와 결정만. 디자인은 2주차 이후 코드와 함께.
2. **기능을 너무 많이 넣으려 함** — Must 6개로도 충분히 가치 있는 청첩장. 욕심은 v1.1로 미루기.
3. **README를 개발 끝나고 쓰려 함** — README-Driven Development가 옳아요. 먼저 쓰고 거기에 맞춰 개발.
4. **이름 고민에 며칠 쓰기** — 30분 안에 결정하고 나중에 바꿔도 돼요 (GitHub은 레포 이름 변경 가능).

---

## 🎯 1주차 완료 체크리스트

주말에 이 항목들이 전부 체크되어 있으면 1주차 성공:

- [ ] GitHub 레포 생성됨 (공개, MIT 라이선스)
- [ ] 한국어 + 영어 README 초안 커밋
- [ ] `invitation.config.ts` 스키마 정의 완료
- [ ] 테마 5종 중 1종(modern)의 컬러 팔레트 결정
- [ ] 디자인 레퍼런스 보드 (Pinterest 등) 구성
- [ ] 이슈 템플릿, PR 템플릿, 프로젝트 보드 셋업
- [ ] ADR 최소 2건 작성
- [ ] v0.1.0 마일스톤 이슈 등록

👉 **모두 되면 2주차 "프로젝트 셋업" 으로 진행!**
