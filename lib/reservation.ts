import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * 현재는 독채 1개만 운영하므로 Room을 하나만 유지합니다.
 * (여러 객실을 운영하게 되면 이 함수 대신 roomId를 직접 넘기도록 확장)
 */
export async function getDefaultRoom() {
  const existing = await prisma.room.findFirst();
  if (existing) return existing;
  return prisma.room.create({
    data: { name: "한옥정원하우스 독채" },
  });
}

/** 두 반열린 구간 [aStart,aEnd) / [bStart,bEnd) 가 겹치는지 여부 */
export function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

/** YYYY-MM-DD 문자열 -> UTC 자정 Date (DB의 @db.Date 컬럼과 일치시키기 위함) */
export function parseDateOnly(value: string): Date {
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("INVALID_DATE");
  return d;
}

export function toDateOnlyString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 예약이 실제로 막혀있는 상태(취소 제외)인지 */
export const ACTIVE_RESERVATION_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * 트랜잭션 내부에서 날짜 겹침 여부를 최종 확인합니다.
 * 프론트엔드 검증을 신뢰하지 않고, 저장 직전 서버에서 다시 확인합니다.
 */
export async function assertNoConflict(
  tx: Prisma.TransactionClient,
  roomId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const conflictingReservation = await tx.reservation.findFirst({
    where: {
      roomId,
      reservationStatus: { in: [...ACTIVE_RESERVATION_STATUSES] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (conflictingReservation) {
    throw new ReservationConflictError("이미 예약이 있는 날짜입니다.");
  }

  const conflictingBlock = await tx.blockedDate.findFirst({
    where: {
      roomId,
      date: { gte: checkIn, lt: checkOut },
    },
  });
  if (conflictingBlock) {
    throw new ReservationConflictError("관리자가 차단한 날짜가 포함되어 있습니다.");
  }
}

export class ReservationConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationConflictError";
  }
}

/** 예약번호 생성: HG + YYYYMMDD + 4자리 순번 (당일 생성 건수 기준) */
export async function generateReservationNumber(tx: Prisma.TransactionClient, on: Date) {
  const y = on.getUTCFullYear();
  const m = String(on.getUTCMonth() + 1).padStart(2, "0");
  const d = String(on.getUTCDate()).padStart(2, "0");
  const prefix = `HG${y}${m}${d}`;

  const dayStart = new Date(Date.UTC(y, on.getUTCMonth(), on.getUTCDate()));
  const dayEnd = new Date(Date.UTC(y, on.getUTCMonth(), on.getUTCDate() + 1));

  const countToday = await tx.reservation.count({
    where: { createdAt: { gte: dayStart, lt: dayEnd } },
  });

  return `${prefix}${String(countToday + 1).padStart(4, "0")}`;
}

/** 1박 기준 총 숙박 요금 계산 (서버가 최종 금액을 다시 계산 — 클라이언트 값을 신뢰하지 않음) */
export function calcNights(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
