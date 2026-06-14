import React from "react";
import type { Order, PaymentStatus } from "./types";
import { isWithinLastNDays } from "../../utils";

interface OrdersMetricsProps {
  orders: Order[];
  paymentStatuses: Map<number, PaymentStatus>;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
  variant?: "default" | "primary" | "success" | "info";
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon, 
  variant = "default" 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          border: "rgb(var(--primary-soft))",
          background: "rgba(var(--primary-soft), 0.2)",
          iconColor: "rgb(var(--primary))",
        };
      case "success":
        return {
          border: "rgb(var(--success-soft))",
          background: "rgba(var(--success-soft), 0.2)",
          iconColor: "rgb(var(--success))",
        };
      case "info":
        return {
          border: "rgb(var(--info-soft))",
          background: "rgba(var(--info-soft), 0.2)",
          iconColor: "rgb(var(--info))",
        };
      default:
        return {
          border: "rgb(var(--border))",
          background: "rgb(var(--surface))",
          iconColor: "rgb(var(--text-secondary))",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      style={{
        padding: "0.75rem",
        border: `1px solid ${styles.border}`,
        borderRadius: "0.375rem",
        background: styles.background,
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
      }}
    >
      <div
        style={{
          fontSize: "1.25rem",
          color: styles.iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgb(var(--text-secondary))",
            marginBottom: "0.125rem",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "rgb(var(--text-primary))",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export const OrdersMetrics: React.FC<OrdersMetricsProps> = ({ 
  orders, 
  paymentStatuses 
}) => {
  // Calculate metrics
  const totalOrders = orders.length;

  const activeOrders = orders.filter((order) =>
    ["new", "active", "ready"].includes(order.status)
  ).length;

  const pendingPayment = orders.filter((order) => {
    const paymentStatus = paymentStatuses.get(order.id);
    return paymentStatus && !paymentStatus.is_fully_paid;
  }).length;

  const thisWeekOrders = orders.filter((order) =>
    isWithinLastNDays(order.entry_date, 7)
  ).length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1rem",
      }}
    >
      <MetricCard
        label="Total Pedidos"
        value={totalOrders}
        icon="📦"
        variant="default"
      />
      <MetricCard
        label="Pedidos Activos"
        value={activeOrders}
        icon="🔄"
        variant="primary"
      />
      <MetricCard
        label="Pendiente de Pago"
        value={pendingPayment}
        icon="💳"
        variant="info"
      />
      <MetricCard
        label="Esta Semana"
        value={thisWeekOrders}
        icon="📅"
        variant="success"
      />
    </div>
  );
};
