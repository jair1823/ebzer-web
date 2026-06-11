import React from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../components";
import { useOrders, useToast } from "../../hooks";
import { AgendaItemForm } from "../agenda/AgendaItemForm";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import type { AgendaCreatePayload, AgendaItemFormData } from "../agenda/types";
import type { Order, OrderFilters } from "./types";

import {
  formatOrderId,
  isoDateStringToLocalDate,
  sortOrdersForTable,
} from "../../utils";
import { agendaService, incomesService } from "../../services";

const formatDateParam = (date: Date): string => date.toLocaleDateString("en-CA");

const getMonthLabel = (date: Date): string => {
  const month = new Intl.DateTimeFormat("es-CR", { month: "long" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}`;
};

const getAgendaNoteTitle = (order: Order): string => {
  const baseTitle = `Nota para pedido ${formatOrderId(order.id)}`;
  const clientName = order.client_name?.trim();

  return clientName ? `${baseTitle} - ${clientName}` : baseTitle;
};

const getAgendaNoteContent = (order: Order): string => {
  const description = order.description.trim();

  return description ? `Pedido: ${description}` : "";
};

export const OrdersPage: React.FC = () => {
  const {
    orders,
    loading,
    finishOrder,
    paymentStatuses,
  } = useOrders();
  const navigate = useNavigate();
  const [isAgendaNoteOpen, setIsAgendaNoteOpen] = React.useState(false);
  const [selectedAgendaNoteOrder, setSelectedAgendaNoteOrder] =
    React.useState<Order | null>(null);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    status_ids: [],
  });
  const {
    isVisible: isToastVisible,
    config: toastConfig,
    hideToast,
    showSuccess,
    showError,
  } = useToast();
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

  const handleClickRow = (orderId: number) => {
    navigate(`/orders/${orderId}/edit`);
  };

  const handleOpenAgendaNote = (order: Order) => {
    setSelectedAgendaNoteOrder(order);
    setIsAgendaNoteOpen(true);
  };

  const handleCloseAgendaNote = () => {
    setIsAgendaNoteOpen(false);
    setSelectedAgendaNoteOrder(null);
  };

  const agendaNoteInitialValues = React.useMemo<
    Partial<AgendaItemFormData> | undefined
  >(() => {
    if (!selectedAgendaNoteOrder) return undefined;

    return {
      type: "note",
      title: getAgendaNoteTitle(selectedAgendaNoteOrder),
      content: getAgendaNoteContent(selectedAgendaNoteOrder),
      due_date: "",
      priority: "medium",
      order_id: String(selectedAgendaNoteOrder.id),
    };
  }, [selectedAgendaNoteOrder]);

  const handleCreateAgendaNote = async (data: AgendaCreatePayload) => {
    try {
      await agendaService.create(data);
      showSuccess("Nota creada");
      handleCloseAgendaNote();
    } catch (error) {
      console.error("Error creating agenda note:", error);
      showError("Error al crear la nota");
      throw error;
    }
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
  const sortedOrders = sortOrdersForTable(filteredOrders);
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
      />
      <OrdersTable
        orders={sortedOrders}
        loading={loading}
        onClickRow={handleClickRow}
        onCreateAgendaNote={handleOpenAgendaNote}
        finishOrder={finishOrderAndRefreshSummary}
        paymentStatuses={paymentStatuses}
      />
      <AgendaItemForm
        isOpen={isAgendaNoteOpen}
        selectedItem={null}
        initialCreateValues={agendaNoteInitialValues}
        orders={orders}
        onClose={handleCloseAgendaNote}
        onSubmit={handleCreateAgendaNote}
      />
      <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
    </div>
  );
};
