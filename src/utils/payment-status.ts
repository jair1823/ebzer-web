import type { PaymentStatus } from "../pages/orders/types";
import type { Income } from "../pages/incomes/types";

/**
 * Calcula el payment status a partir de un array de incomes y el amount_charged de la orden
 */
export function calculatePaymentStatus(
  amountCharged: number,
  incomes: Income[] | { amount: number }[]
): PaymentStatus {
  const totalPaid = incomes.reduce((sum, income) => sum + income.amount, 0);
  const remaining = Math.max(0, amountCharged - totalPaid);
  const percentagePaid = amountCharged > 0 ? (totalPaid / amountCharged) * 100 : 0;
  const isFullyPaid = remaining === 0 && totalPaid > 0;

  return {
    total_paid: totalPaid,
    amount_charged: amountCharged,
    remaining,
    percentage_paid: percentagePaid,
    is_fully_paid: isFullyPaid,
  };
}

/**
 * Retorna las clases CSS para el badge de estado de pago según el porcentaje pagado
 */
export function getPaymentBadgeClasses(paymentStatus: PaymentStatus): string {
  if (paymentStatus.is_fully_paid) {
    // Verde - Pagado completo
    return "bg-success-subtle text-success border border-success-muted";
  }
  
  if (paymentStatus.percentage_paid === 0) {
    // Rojo - Sin pagos
    return "bg-danger-subtle text-danger border border-danger-muted";
  }
  
  // Amarillo - Pago parcial
  return "bg-warning-subtle text-warning border border-warning-muted";
}

/**
 * Retorna el texto a mostrar en el badge de estado de pago
 */
export function getPaymentBadgeText(paymentStatus: PaymentStatus): string {
  if (paymentStatus.is_fully_paid) {
    return "Pagado";
  }
  
  if (paymentStatus.percentage_paid === 0) {
    return "Pendiente";
  }
  
  // Pago parcial - mostrar porcentaje
  return `${Math.round(paymentStatus.percentage_paid)}% Pagado`;
}

/**
 * Formatea el monto restante para mostrar en UI
 * Ejemplo: "Falta: $500.00"
 */
export function formatRemainingAmount(remaining: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(remaining);
}

/**
 * Retorna una descripción completa del estado de pago
 * Ejemplo: "$600 de $1,000 (60%)"
 */
export function getPaymentDescription(paymentStatus: PaymentStatus): string {
  const paidFormatted = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(paymentStatus.total_paid);

  const totalFormatted = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(paymentStatus.amount_charged);

  const percentage = Math.round(paymentStatus.percentage_paid);

  return `${paidFormatted} de ${totalFormatted} (${percentage}%)`;
}
