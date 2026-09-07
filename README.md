# 한옥정원하우스 홈페이지 프로젝트

순천 낙안읍성 인근 독채 한옥펜션 「한옥정원하우스」 예약 플랫폼.

GitHub: https://github.com/faraohminsung-eng/hanok-garden-house

기술 스택: **Next.js (App Router) + TypeScript + Prisma + PostgreSQL**

## 현재 상태 (2026-09-07)

- **디자인 목업**: `design/Main.dc.html` — 게시된 캔버스: https://claude.ai/code/artifact/2c8be718-2406-4602-b06c-e2fb0c170747
- **정적 프로토타입(참고용, 더 이상 사용 안 함)**: `static-prototype-reference/`
- **PHASE 2 메인 홈페이지** — 구현 완료 (`app/page.tsx` 및 `components/`)
- **PHASE 4~5 예약 캘린더 + 예약 DB** — 구현 완료
  - `/reservation`: 캘린더에서 날짜 선택 → 인원/예약자 정보 입력 → 결제방법 선택(계좌이체/현장결제) → 예약 신청
  - `/reservation/check`: 예약번호 + 휴대전화로 예약 조회
  - 서버(API 라우트)가 저장 직전 트랜잭션(Serializable) 안에서 날짜 중복을 다시 검증 — 동시 예약 방지
  - 예약금액은 항상 서버에서 재계산 (클라이언트가 보낸 금액을 신뢰하지 않음)
- **아직 구현하지 않은 것** (다음 단계)
  - 카드결제 PG 연동 (요청 시 "준비 중"으로 비활성화 표시됨)
  - 관리자 페이지 (예약관리/가격관리/입금확인/날짜차단 등) — 관리자 인증 포함
  - 사진 업로드 시스템, 실제 지도 연동, 카카오톡 채널 연결

## 실행 방법

```bash
npm install
cp .env.example .env   # DATABASE_URL을 실제 PostgreSQL 접속정보로 수정
npx prisma migrate dev --name init
npm run dev
```

`DATABASE_URL`을 설정하지 않으면 홈페이지/디자인은 정상 동작하지만, 예약 캘린더·예약 신청·예약조회 API는 500 오류를 반환합니다.

## 폴더 구조

```
app/                  # Next.js App Router 페이지 & API 라우트
  page.tsx              # 메인 홈페이지
  reservation/           # 예약 캘린더 · 예약 신청
  reservation/check/      # 예약 확인 조회
  api/availability/        # 월별 예약 가능 여부 조회
  api/reservations/         # 예약 생성 (서버 검증 + 트랜잭션)
  api/reservations/lookup/   # 예약번호+휴대전화로 조회
components/            # 홈페이지 섹션 & 예약 UI 컴포넌트
lib/prisma.ts          # Prisma Client 싱글턴 (Postgres 어댑터)
lib/reservation.ts      # 예약 중복검증 · 금액계산 · 예약번호 생성
prisma/schema.prisma    # DB 스키마 (Room / Reservation / BlockedDate)
design/                 # Claude Design 캔버스 소스 (메인 페이지 목업)
static-prototype-reference/  # 이전 정적 HTML 시안 (참고용, 더 이상 사용 안 함)
```

## 다음 단계 (예정)

1. 관리자 페이지 (로그인, 예약관리, 입금확인, 날짜 차단, 가격관리)
2. 카드결제 PG 연동 (PaymentService 추상화 — 토스페이먼츠/이니시스/나이스페이 교체 가능하게)
3. 결제 취소/환불 처리
4. 사진 업로드 시스템, 카카오맵/네이버맵, 카카오톡 채널 연동
5. 배포 (Vercel 등) + 실제 PostgreSQL(예: Supabase, Neon) 연결
