# jeongwon

순천 낙안읍성 인근 독채 한옥펜션 「한옥정원하우스」 예약 플랫폼. (프로젝트 코드명: jeongwon — 사이트에 노출되는 브랜드명은 그대로 "한옥정원하우스"입니다)

GitHub: https://github.com/faraohminsung-eng/jeongwon
배포: https://jeongwon.vercel.app (Vercel + Supabase PostgreSQL, 서울 리전)

기술 스택: **Next.js (App Router) + TypeScript + Prisma + PostgreSQL**

## 현재 상태 (2026-09-08)

- **실서비스 배포 완료**: Vercel(팀 `web`) + Supabase(프로젝트 `jeongwon`, ap-northeast-2)에 연결되어 실제로 동작 중
  - Vercel 환경변수: `DATABASE_URL`(Supabase 세션 풀러), `AUTH_SECRET`, `ADMIN_SETUP_TOKEN`, `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`
  - `package.json`의 `postinstall`이 `prisma generate`를 자동 실행 (Vercel은 저장소에 없는 `lib/generated/prisma`를 빌드 시점에 새로 생성해야 함)
  - Supabase 커넥션은 direct(`db.<ref>.supabase.co:5432`, IPv6 전용)가 아니라 세션 풀러(`aws-0-<region>.pooler.supabase.com:5432`)를 사용해야 함

- **디자인 목업**: `design/Main.dc.html` — 게시된 캔버스: https://claude.ai/code/artifact/2c8be718-2406-4602-b06c-e2fb0c170747
- **정적 프로토타입(참고용, 더 이상 사용 안 함)**: `static-prototype-reference/`
- **PHASE 2 메인 홈페이지** — 구현 완료
- **PHASE 4~5 예약 캘린더 + 예약 DB** — 구현 완료
  - `/reservation`: 캘린더에서 날짜 선택 → 인원/예약자 정보 입력 → 결제방법 선택 → 예약 신청
  - `/reservation/check`: 예약번호 + 휴대전화로 예약 조회
  - 서버가 저장 직전 트랜잭션(Serializable)에서 날짜 중복을 다시 검증 — 동시 예약 방지
  - 예약금액은 항상 서버에서 재계산 (클라이언트 값을 신뢰하지 않음)
- **PHASE 6 관리자 페이지** — 구현 완료
  - `/admin/setup`·`/admin/login`, 대시보드, 예약관리(확정/결제완료/취소/환불), 예약 캘린더(날짜 차단), 가격관리, **사이트 설정**, **사진관리**
  - 권한: SUPER_ADMIN/MANAGER 쓰기, STAFF 조회 전용
- **카드결제 (토스페이먼츠)** — 구현 완료
  - `/payment`, `/payment/result` — 결제창 SDK 연동 + 서버 측 결제 승인 재검증(`lib/payment/`)
  - `PaymentProvider` 인터페이스 뒤에 토스 구현체를 감춰서, 다른 PG로 교체해도 예약 흐름 코드는 바뀌지 않도록 설계
  - **`.env`의 키는 토스페이먼츠가 공식 문서에 공개한 테스트 전용 키입니다.** 실결제는 되지 않으며, 실 서비스로 전환하려면 [developers.tosspayments.com](https://developers.tosspayments.com)에서 본인 계정으로 발급받은 키로 교체해야 합니다 (사업자 가입은 실결제 전환 시에만 필요).
- **사진 업로드** — 구현 완료 (`/admin/gallery`)
  - 업로드 시 sharp로 WebP 변환 + 리사이즈. 기본은 로컬 디스크 저장(`data/uploads`, `/api/uploads/[key]`로 서빙), `S3_BUCKET` 환경변수를 설정하면 S3 호환 스토리지(R2/Supabase Storage 등)로 자동 전환됩니다.
  - **주의**: Vercel 등 서버리스 배포에서는 로컬 디스크가 유지되지 않으므로 실 서비스에는 S3 계열을 반드시 사용하세요.
  - 홈페이지 갤러리/히어로 배경은 실제 업로드된 사진이 있으면 그것을 쓰고, 없으면 플레이스홀더를 보여줍니다.
- **지도 · 카카오채널 · 연락처 · 환불정책** — `/admin/settings`에서 관리
  - 카카오맵 JS 키 + 주소를 입력하면 홈페이지 LOCATION 섹션에 실제 지도가 표시됩니다 (미입력 시 플레이스홀더 유지)
  - 카카오톡 채널 URL, 전화번호, 계좌이체 정보, 현장결제 허용 여부, 체크인까지 남은 일수 기준 환불 정책을 여기서 설정
- **환불 처리** — 관리자 예약관리 화면에서 결제완료 예약에 "환불" 처리 가능. 환불정책 기준 추천 금액을 보여주고, 카드결제 건은 토스 결제취소 API까지 실제로 호출합니다.
- 로컬 Postgres(`npx prisma dev`)로 전체 플로우를 실제로 검증: 설정 저장 → 가격설정 → 예약생성(계좌이체/카드) → 현장결제 비활성화 적용 확인 → 관리자 확정 → 환불 처리(정책 계산 포함) → 캘린더에 반영 → 사진 업로드/서빙/삭제 → 카드결제 승인 실패 시 예약이 잘못 확정되지 않는지까지 확인 완료.
- **아직 구현하지 않은 것**: 관리자 계정 관리 UI(계정 추가/삭제/권한 변경), 매출 CSV 다운로드, 결제대기 예약 자동 만료(크론 필요), 네이버맵/네이버예약 연동

## 실행 방법

```bash
npm install
cp .env.example .env   # DATABASE_URL / AUTH_SECRET / ADMIN_SETUP_TOKEN 을 실제 값으로 수정
npx prisma migrate dev   # 이미 생성된 마이그레이션을 DB에 적용
npm run dev
```

`DATABASE_URL`을 설정하지 않으면 홈페이지는 정상 동작하지만, 예약·관리자·결제 관련 API는 500 오류를 반환합니다.
DB 연결 후 `/admin/setup`에서 `.env`의 `ADMIN_SETUP_TOKEN`으로 최초 관리자 계정을 만들고, `/admin/settings`에서 연락처·계좌·카카오·지도·환불정책을, `/admin/pricing`에서 가격을 입력하세요.

## 폴더 구조

```
app/
  page.tsx                        # 메인 홈페이지
  reservation/, reservation/check/  # 예약 캘린더 · 예약 신청 · 예약 확인
  payment/, payment/result/          # 카드결제 · 결제 승인 콜백
  admin/setup/, admin/login/          # 관리자 계정 생성 · 로그인
  admin/(dashboard)/                   # 로그인 필요 — 대시보드/예약관리/캘린더/가격/사진/설정
  api/availability/, api/reservations/  # 공개 예약 API (서버 검증 + 트랜잭션)
  api/settings/, api/uploads/[key]/      # 공개 설정 조회 · 로컬 업로드 파일 서빙
  api/admin/                              # 관리자 전용 API (세션 인증 필요)
components/                # 홈페이지 섹션 & 예약/결제/관리자 UI 컴포넌트
lib/prisma.ts              # Prisma Client 싱글턴 (Postgres 어댑터)
lib/reservation.ts          # 예약 중복검증 · 금액계산 · 예약번호 생성
lib/adminAuth.ts             # 관리자 인증 (비밀번호 해시, 세션 쿠키 서명/검증)
lib/settings.ts               # 사이트 설정 조회/수정, 환불률 계산
lib/storage.ts                 # 사진 저장소 추상화 (로컬 디스크 / S3 호환)
lib/payment/                    # PaymentProvider 추상화 + 토스페이먼츠 구현체
prisma/schema.prisma             # DB 스키마
prisma/migrations/                # 적용된 마이그레이션 이력
design/                              # Claude Design 캔버스 소스 (메인 페이지 목업)
static-prototype-reference/           # 이전 정적 HTML 시안 (참고용, 더 이상 사용 안 함)
```

## 다음 단계 (예정)

1. 관리자 계정 관리 UI (추가/삭제/권한 변경), 매출 통계 · CSV 다운로드
2. 결제대기 예약 자동 만료 (스케줄 작업 필요)
3. 네이버맵 · 네이버예약 연동
4. 배포 (Vercel 등) + 실제 PostgreSQL(Supabase/Neon) + 실 토스페이먼츠 계정 + S3 계열 스토리지 연결
