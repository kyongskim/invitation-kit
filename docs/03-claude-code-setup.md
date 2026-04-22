# Claude Code로 시작하기

> 이 프로젝트를 Claude Code에서 개발하는 방법

---

## 1. Claude Code 설치

아직 설치 안 하셨으면:

```bash
npm install -g @anthropic-ai/claude-code
```

Node.js 18+ 필요. macOS/Linux/Windows(WSL) 지원.

설치 후 한 번 실행해서 로그인:

```bash
claude
```

## 2. 프로젝트 폴더 준비

이 대화에서 받은 파일들을 로컬 폴더에 두세요. 예를 들어:

```
~/projects/invitation-kit/
├── CLAUDE.md                    # Claude Code가 매 세션 자동 로드
├── README.md
├── README.en.md
├── invitation.config.ts
└── docs/
    ├── 01-project-brief.md
    ├── 02-week01-daily-guide.md
    └── 03-claude-code-setup.md  # 이 파일
```

**`CLAUDE.md`가 프로젝트 루트에 있는 것이 가장 중요해요.** Claude Code는 이 파일을 매 세션 시작 시 자동으로 읽어요.

## 3. GitHub 레포와 연결

Day 1 태스크(`docs/02-week01-daily-guide.md` 참고)대로 public 레포를 먼저 만들었다면:

```bash
cd ~/projects/invitation-kit
git init
git remote add origin https://github.com/본인계정/invitation-kit.git
git add .
git commit -m "docs: initial project setup"
git push -u origin main
```

## 4. 첫 Claude Code 세션

프로젝트 폴더에서 claude 실행:

```bash
cd ~/projects/invitation-kit
claude
```

첫 프롬프트로 아래 내용을 붙여넣으세요:

```
안녕! 이 프로젝트의 현재 상태를 파악해줘.

1. CLAUDE.md를 먼저 읽고 프로젝트 개요 이해
2. docs/ 안의 문서들을 확인
3. git log로 어디까지 진행됐는지 확인
4. 지금 할 수 있는 가장 우선순위 높은 태스크 하나를 제안

아직 코드는 건드리지 말고, 네가 파악한 내용을 요약해서 알려줘.
```

Claude Code가 문서들을 읽고 현재 1주차 어디쯤인지, 다음에 뭘 해야 하는지 자동으로 파악해줘요.

## 5. 권한 모드 이해

Claude Code에서 첫 실행 시 권한 모드를 선택해요:

- **Ask (기본)**: 파일 수정·명령 실행 전마다 승인 요청 → **1주차는 이 모드 추천**
- **Accept Edits**: 파일 수정은 자동, 명령 실행만 승인
- **Plan Mode**: 읽기만 가능, 쓰기·실행 금지 → **설계 논의할 때 유용**
- **Bypass**: 모든 것 자동 → 주의해서 사용

세션 중에 `Shift+Tab`으로 모드 전환 가능.

## 6. 자주 쓰는 슬래시 명령

- `/init` — CLAUDE.md 초기 생성 (이 프로젝트는 이미 있음, 실행 불필요)
- `/memory` — CLAUDE.md 및 auto memory 파일 편집
- `/clear` — 현재 세션 컨텍스트 초기화 (새 태스크 시작 시 유용)
- `/compact` — 대화를 요약해 컨텍스트 공간 확보 (긴 세션에서)
- `/cost` — 현재 세션 토큰 사용량 확인
- `/plan` — Plan Mode 진입
- `/review` — 최근 변경사항 리뷰 요청
- `/help` — 전체 명령어 목록

## 7. 효율적으로 쓰는 팁

### 한 세션 = 한 태스크

긴 세션은 컨텍스트 오염이 생겨요. Day 1 끝나면 `/clear` 또는 새 세션 시작.

### Plan Mode를 적극 활용

큰 변경 전에 `Shift+Tab`으로 Plan Mode 진입 → 계획 검토 → 동의하면 일반 모드로 돌아와 실행. 특히 2주차 Next.js 초기화처럼 되돌리기 어려운 작업에서 유용.

### Auto Memory 이해

Claude Code v2.1.59+는 세션 중 배운 것을 자동으로 기억해요 (build 명령어, 자주 실수하는 부분 등). `/memory`로 확인 가능. 너무 지저분해지면 직접 편집해서 정리하세요.

### 주차별 회고를 반드시 남기기

매 주차 끝날 때 다음 프롬프트로 회고 작성을 요청:

```
이번 주차 회고를 docs/retrospective/week-XX.md 로 작성해줘.
- 완료한 것
- 막혔던 것
- 다음 주차로 넘어가는 결정사항
- CLAUDE.md를 업데이트해야 할 내용
```

다음 주차 세션에서 이 파일이 자동 컨텍스트가 돼요.

## 8. 예상 워크플로우 — 2주차 예시

2주차 시작할 때 이런 식으로 진행하시면 돼요:

```
Day 1: cd ~/projects/invitation-kit && claude
→ "2주차 시작이야. CLAUDE.md와 docs/02를 읽고
   Next.js 초기화 계획을 세워줘. Plan Mode로."

Day 2: (이어서)
→ "계획대로 Next.js 초기화 진행해줘.
   단, 기존 CLAUDE.md, docs/, invitation.config.ts는 건드리지 말 것."

Day 3:
→ "Tailwind 설정이랑 Prettier, ESLint 셋업해줘.
   Tailwind plugin도 포함해서."

Day 4:
→ ".github/workflows/ci.yml 만들어서 lint + typecheck + build를
   main 푸시와 PR에서 돌리게 해줘."

Day 5:
→ "invitation.config.ts를 app/page.tsx에서 import해서
   신랑/신부 이름만 화면에 보여주는 최소 페이지 만들어줘."

Day 6:
→ "Vercel에 배포하는 방법 안내해줘. CLI 설치부터."

Day 7:
→ "2주차 회고 docs/retrospective/week-02.md로 정리하고,
   CLAUDE.md의 '자주 쓰는 명령어' 섹션을 실제 npm 명령어로 업데이트."
```

각 Day는 30분~2시간 사이. 사이사이 `/clear`로 컨텍스트 초기화하거나 완전히 새 세션으로 진행하세요.

## 9. 문제 생기면

- CLAUDE.md를 무시하는 것 같음 → `/memory`로 파일 존재 확인. 내용이 너무 길면(300줄+) 줄이기.
- 토큰 사용이 빠름 → `/compact` 또는 `/clear`. 꼭 필요한 파일만 대화에 올리기.
- 의도치 않은 변경 → `git diff` 로 확인, `git checkout -- <file>`로 되돌리기.
- 플러그인 탐색 → `/plugin`으로 shadcn, tailwind 관련 플러그인 설치 가능.

## 10. 다음 단계

이 파일을 다 읽었으면, 위의 "4. 첫 Claude Code 세션"의 첫 프롬프트를 실제로 실행해 보세요. 그게 1주차의 Day 1 시작이에요.
