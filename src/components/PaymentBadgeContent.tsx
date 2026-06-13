import type { FC } from "react";
import { Circle, CircleCheck, CircleDashed } from "lucide-react";
import type { PaymentStatus } from "../pages/orders/types";
import { getPaymentBadgeText } from "../utils";

interface PaymentBadgeContentProps {
  paymentStatus: PaymentStatus;
  iconSize?: number;
}

export const PaymentBadgeContent: FC<PaymentBadgeContentProps> = ({
  paymentStatus,
  iconSize = 14,
}) => {
  const Icon = paymentStatus.is_fully_paid
    ? CircleCheck
    : paymentStatus.percentage_paid === 0
    ? Circle
    : CircleDashed;

  return (
    <>
      <Icon size={iconSize} strokeWidth={2} aria-hidden="true" />
      <span>{getPaymentBadgeText(paymentStatus)}</span>
    </>
  );
};
