# 한옥정원하우스 홈페이지 프로젝트

순천 낙안읍성 인근 독채 한옥펜션 「한옥정원하우스」 홈페이지 구축 프로젝트.

## 현재 상태

- **메인 페이지 시각 목업 완료** (2026-09-07)
  - 소스: `design/Main.dc.html`, `design/canvas.json`
  - 게시된 목업(Claude Design 캔버스): https://claude.ai/code/artifact/2c8be718-2406-4602-b06c-e2fb0c170747
  - 구성: HERO → ABOUT → THE HANOK → THE GARDEN → SPACE → EXPERIENCE → GALLERY → SUNCHON TRAVEL → REVIEW → RESERVATION → LOCATION → FOOTER
  - 실제 사진 없이 플레이스홀더로 표시했고, 확인되지 않은 가격/거리/주소/전화번호 등은 "확인 필요"로 남겨둠

## 목표

숙소 소개 → 객실/공간 확인 → 날짜 선택 → 예약 → 결제 → 예약확인 → 관리자 관리까지 하나의 웹 시스템으로 구축.
자세한 요구사항은 대화 기록(기획 원문) 참고.

## 폴더 구조

```
design/
  Main.dc.html      # 메인 페이지 목업 소스 (Claude Design Component 포맷)
  canvas.json        # 디자인 캔버스 레이아웃
  *-landing.html      # 캔버스 편집기가 seed된 산출물 (git 추적 제외, 재생성 가능)
```

## 다음 단계 (예정)

1. 서브페이지 목업 (예약/객실상세 등)
2. 실제 예약 시스템 (날짜 중복 방지, 서버 가격 계산)
3. 결제 연동 (카드/계좌이체/현장결제)
4. 관리자 페이지
