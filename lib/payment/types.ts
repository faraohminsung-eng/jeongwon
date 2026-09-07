export type ConfirmInput = { paymentKey: string; orderId: string; amount: number };
export type ConfirmResult =
  | { success: true; approvedAt: string; receiptUrl: string | null; raw: unknown }
  | { success: false; errorCode: string; errorMessage: string; raw: unknown };

export type CancelInput = { paymentKey: string; cancelReason: string; cancelAmount?: number };
export type CancelResult =
  | { success: true; cancelledAt: string; raw: unknown }
  | { success: false; errorCode: string; errorMessage: string; raw: unknown };

/**
 * 카드결제 PG사를 이 인터페이스 뒤로 감춰서, 필요시 다른 PG(이니시스/나이스페이 등)로
 * 교체하더라도 예약/결제 흐름 코드는 바뀌지 않도록 합니다.
 */
export interface PaymentProvider {
  readonly name: string;
  confirm(input: ConfirmInput): Promise<ConfirmResult>;
  cancel(input: CancelInput): Promise<CancelResult>;
}
