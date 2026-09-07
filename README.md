# jeongwon

순천 낙안읍성 인근 독채 한옥펜션 「한옥정원하우스」 예약 플랫폼. (프로젝트 코드명: jeongwon — 사이트에 노출되는 브랜드명은 그대로 "한옥정원하우스"입니다)

GitHub: https://github.com/faraohminsung-eng/jeongwon

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
- **PHASE 6 관리자 페이지** — 구현 완료
  - `/admin/setup`: 최초 관리자 계정 생성 (Admin 테이블이 비어있고 `ADMIN_SETUP_TOKEN`이 일치할 때만 1회 사용 가능)
  - `/admin/login`: 로그인 (bcrypt 해시 비밀번호 + HMAC 서명 세션 쿠키, httpOnly)
  - `/admin`: 대시보드 (오늘 체크인/체크아웃, 현재 예약, 입금대기, 이번 달 매출 등)
  - `/admin/reservations`: 예약 목록 검색/필터, 확정(입금확인)·결제완료·취소 처리
  - `/admin/calendar`: 날짜 클릭으로 차단/차단해제 (이미 예약된 날짜는 차단 불가)
  - `/admin/pricing`: 기본 숙박 가격 설정
  - 권한: SUPER_ADMIN/MANAGER는 쓰기 가능, STAFF는 조회 전용
  - 로컬 Postgres(`npx prisma dev`)로 전체 흐름(가격설정→예약생성→중복차단→관리자확정→날짜차단) 실제 동작 확인 완료
- **아직 구현하지 않은 것** (다음 단계)
  - 카드결제 PG 연동 (요청 시 "준비 중"으로 비활성화 표시됨)
  - 사진 업로드 시스템, 실제 지도 연동, 카카오톡 채널 연결
  - 관리자 계정 관리 UI(관리자 추가/삭제), 환불 처리, 매출 CSV 다운로드

## 실행 방법

```bash
npm install
cp .env.example .env   # DATABASE_URL / AUTH_SECRET / ADMIN_SETUP_TOKEN 을 실제 값으로 수정
npx prisma migrate dev   # 이미 생성된 마이그레이션을 DB에 적용
npm run dev
```

`DATABASE_URL`을 설정하지 않으면 홈페이지/디자인은 정상 동작하지만, 예약·관리자 관련 API는 500 오류를 반환합니다.
DB 연결 후 `/admin/setup`에서 `.env`의 `ADMIN_SETUP_TOKEN`으로 최초 관리자 계정을 만드세요.

## 폴더 구조

```
app/                       # Next.js App Router 페이지 & API 라우트
  page.tsx                   # 메인 홈페이지
  reservation/                # 예약 캘린더 · 예약 신청
  reservation/check/           # 예약 확인 조회
  admin/setup/                  # 최초 관리자 계정 생성
  admin/login/                   # 관리자 로그인
  admin/(dashboard)/              # 로그인 필요 — 대시보드/예약관리/캘린더/가격관리
  api/availability/                 # 월별 예약 가능 여부 조회
  api/reservations/                  # 예약 생성 (서버 검증 + 트랜잭션)
  api/reservations/lookup/            # 예약번호+휴대전화로 조회
  api/admin/                           # 관리자 전용 API (세션 인증 필요)
components/                # 홈페이지 섹션 & 예약/관리자 UI 컴포넌트
lib/prisma.ts             # Prisma Client 싱글턴 (Postgres 어댑터)
lib/reservation.ts         # 예약 중복검증 · 금액계산 · 예약번호 생성
lib/adminAuth.ts            # 관리자 인증 (비밀번호 해시, 세션 쿠키 서명/검증)
prisma/schema.prisma        # DB 스키마 (Room / Reservation / BlockedDate / Admin)
prisma/migrations/           # 적용된 마이그레이션 이력
design/                        # Claude Design 캔버스 소스 (메인 페이지 목업)
static-prototype-reference/     # 이전 정적 HTML 시안 (참고용, 더 이상 사용 안 함)
```

## 다음 단계 (예정)

1. 카드결제 PG 연동 (PaymentService 추상화 — 토스페이먼츠/이니시스/나이스페이 교체 가능하게)
2. 결제 취소/환불 처리, 관리자 계정 관리 UI
3. 사진 업로드 시스템, 카카오맵/네이버맵, 카카오톡 채널 연동
4. 배포 (Vercel 등) + 실제 PostgreSQL(예: Supabase, Neon) 연결
