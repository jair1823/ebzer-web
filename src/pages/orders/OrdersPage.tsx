import React from "react";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import type { Order, OrderFilters } from "./types";

import { useOrders } from "../../hooks";
import { isoDateStringToLocalDate } from "../../utils";
import { incomesService } from "../../services";

const formatDateParam = (date: Date): string => date.toLocaleDateString("en-CA");

const getMonthLabel = (date: Date): string => {
  const month = new Intl.DateTimeFormat("es-CR", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}`;
};

export const OrdersPage: React.FC = () => {
  const {
    orders,
    loading,
    createOrder,
    selectedOrder,
    setSelectedOrder,
    updateOrder,
    finishOrder,
    paymentStatuses,
    getAllOrders,
  } = useOrders();
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    status_ids: [],
  });
  const monthRange = React.useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      from: formatDateParam(start),
      to: formatDateParam(end),
      start,
      end,
      label: getMonthLabel(now),
    };
  }, []);
  const [monthlyIncome, setMonthlyIncome] = React.useState(0);

  const loadMonthlyIncomes = React.useCallback(async () => {
    try {
      const incomes = await incomesService.getAllIncomes({
        from: monthRange.from,
        to: monthRange.to,
      });
      const total = incomes.reduce((sum, income) => {
        const incomeDate = new Date(income.date);
        if (incomeDate >= monthRange.start && incomeDate < monthRange.end) {
          return sum + income.amount;
        }
        return sum;
      }, 0);

      setMonthlyIncome(total);
    } catch (error) {
      console.error("Error fetching monthly incomes:", error);
      setMonthlyIncome(0);
    }
  }, [monthRange]);

  React.useEffect(() => {
    loadMonthlyIncomes();
  }, [loadMonthlyIncomes]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleOpenCreateOrder = () => {
    setIsOpen(true);
    setSelectedOrder(null);
  };

  const handleClickRow = (orderId: number) => {
    setSelectedOrder(orders.find((order) => order.id === orderId) || null);
    toggleModal();
  };

  const applyFilters = (orders: Order[]): Order[] => {
    return orders.filter((order) => {
      // Filter by date range (using estimated_delivery_date)
      if (filters.dateFrom && order.estimated_delivery_date) {
        const orderDate = isoDateStringToLocalDate(order.estimated_delivery_date);
        const fromDate = isoDateStringToLocalDate(filters.dateFrom);
        if (orderDate && fromDate && orderDate < fromDate) return false;
      }

      if (filters.dateTo && order.estimated_delivery_date) {
        const orderDate = isoDateStringToLocalDate(order.estimated_delivery_date);
        const toDate = isoDateStringToLocalDate(filters.dateTo);
        if (orderDate && toDate && orderDate > toDate) return false;
      }

      // Filter by status_id (empty array = show all)
      if (filters.status_ids.length > 0) {
        if (!filters.status_ids.includes(order.status_id)) return false;
      }

      return true;
    });
  };

  const filteredOrders = applyFilters(orders);
  const ordersSummary = React.useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status && !order.status.is_final_status
    ).length;
    const pendingCollection = orders.reduce((sum, order) => {
      const status = paymentStatuses.get(order.id) ?? order.payment_status;
      return sum + Math.max(status?.remaining ?? order.amount_charged, 0);
    }, 0);
    const totalAmount = orders.reduce((sum, order) => sum + order.amount_charged, 0);

    return {
      monthlyIncome,
      activeOrders,
      pendingCollection,
      pendingPercentage: totalAmount > 0 ? (pendingCollection / totalAmount) * 100 : 0,
      monthLabel: monthRange.label,
    };
  }, [monthRange.label, monthlyIncome, orders, paymentStatuses]);

  const refreshOrdersAndSummary = React.useCallback(async () => {
    const response = await getAllOrders();
    await loadMonthlyIncomes();
    return response;
  }, [getAllOrders, loadMonthlyIncomes]);

  const finishOrderAndRefreshSummary = React.useCallback(
    async (orderId: number) => {
      const response = await finishOrder(orderId);
      await loadMonthlyIncomes();
      return response;
    },
    [finishOrder, loadMonthlyIncomes]
  );

  return (
    <div className="py-2">
      <OrdersHeader
        summary={ordersSummary}
        filters={filters}
        setFilters={setFilters}
        createOrder={createOrder}
        getAllOrders={refreshOrdersAndSummary}
        updateOrder={updateOrder}
        isOpen={isOpen}
        openCreateOrder={handleOpenCreateOrder}
        toggleModal={toggleModal}
        selectedOrder={selectedOrder}
        finishOrder={finishOrderAndRefreshSummary}
        selectedOrderPaymentStatus={
          selectedOrder ? paymentStatuses.get(selectedOrder.id) ?? null : null
        }
      />
      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        onClickRow={handleClickRow}
        finishOrder={finishOrderAndRefreshSummary}
        paymentStatuses={paymentStatuses}
      />
    </div>
  );
};
