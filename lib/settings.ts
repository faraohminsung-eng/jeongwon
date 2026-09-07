import { prisma } from "@/lib/prisma";

export type RefundRule = { daysBefore: number; refundRate: number };

export const DEFAULT_REFUND_POLICY: RefundRule[] = [
  { daysBefore: 7, refundRate: 100 },
  { daysBefore: 5, refundRate: 70 },
  { daysBefore: 3, refundRate: 50 },
  { daysBefore: 1, refundRate: 20 },
  { daysBefore: 0, refundRate: 0 },
];

const SETTING_ID = "singleton";

export async function getSiteSettings() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: SETTING_ID } });
  if (existing) return existing;
  return prisma.siteSetting.create({ data: { id: SETTING_ID, refundPolicy: DEFAULT_REFUND_POLICY } });
}

export async function updateSiteSettings(data: Record<string, unknown>) {
  await getSiteSettings(); // 없으면 먼저 생성
  return prisma.siteSetting.update({ where: { id: SETTING_ID }, data });
}

/** 체크인까지 남은 일수를 기준으로 환불률(%)을 계산합니다. */
export function getRefundRate(policy: RefundRule[] | null | undefined, daysUntilCheckIn: number): number {
  const rules = (policy && policy.length > 0 ? policy : DEFAULT_REFUND_POLICY)
    .slice()
    .sort((a, b) => b.daysBefore - a.daysBefore);

  for (const rule of rules) {
    if (daysUntilCheckIn >= rule.daysBefore) return rule.refundRate;
  }
  return rules.length > 0 ? rules[rules.length - 1].refundRate : 0;
}
