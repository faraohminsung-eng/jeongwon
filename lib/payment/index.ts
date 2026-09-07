import type { PaymentProvider } from "./types";
import { tossProvider } from "./tossProvider";

export function getPaymentProvider(): PaymentProvider {
  // 현재는 토스페이먼츠 하나만 연결되어 있습니다.
  // 다른 PG로 교체하려면 여기서 provider만 바꾸면 됩니다 (호출부 코드는 변경 불필요).
  return tossProvider;
}

export type { ConfirmInput, ConfirmResult, CancelInput, CancelResult, PaymentProvider } from "./types";
