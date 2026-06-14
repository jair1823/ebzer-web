# Fase 1: Estructura y Estado para Sistema de Filtros

**Objetivo**: Preparar la infraestructura de tipos y estado para el sistema de filtros de pedidos.

**Contexto**: OrdersHeader actualmente solo tiene un comentario `{/* todo filters */}` y el botón de crear orden. Necesitamos crear la base de tipos y estado antes de construir la UI.

---

## Alcance de esta Fase

Esta fase **NO** modifica la UI. Solo prepara:
- Tipos TypeScript para filtros
- Estado de filtros en OrdersPage
- Función de filtrado client-side
- Props necesarias para OrdersHeader

---

## Step 1: Definir Tipos de Filtros

**Archivo**: `src/pages/orders/types.ts`

**Tarea**: Agregar interface `OrderFilters` al archivo de tipos existente.

### Tipos a Agregar

```typescript
export interface OrderFilters {
  dateFrom: string | null;  // ISO date string (yyyy-MM-dd) or null
  dateTo: string | null;    // ISO date string (yyyy-MM-dd) or null
  statuses: OrderStatus[];  // Array of selected statuses, empty = show all
}
```

### Ubicación

Agregar después de la interface `PaymentStatus` (última interface del archivo).

### Validación

- [x] Interface exportada correctamente
- [x] Usa tipo `OrderStatus` existente
- [x] Permite valores null para fechas (filtro opcional)
- [x] Array de statuses puede estar vacío (mostrar todos)

---

## Step 2: Implementar Estado de Filtros en OrdersPage

**Archivo**: `src/pages/orders/OrdersPage.tsx`

**Tarea**: Agregar estado de filtros, función de filtrado, y pasar datos filtrados a la tabla.

### 2.1: Importar Tipo OrderFilters

```typescript
import type { OrderFilters } from "./types";
```

### 2.2: Agregar Estado Inicial de Filtros

Después del estado `isOpen`, agregar:

```typescript
const [filters, setFilters] = React.useState<OrderFilters>({
  dateFrom: null,
  dateTo: null,
  statuses: [],
});
```

### 2.3: Crear Función de Filtrado

Agregar función `applyFilters` antes del return:

```typescript
const applyFilters = (orders: Order[]): Order[] => {
  return orders.filter((order) => {
    // Filter by date range (using estimated_delivery_date)
    if (filters.dateFrom && order.estimated_delivery_date) {
      const orderDate = new Date(order.estimated_delivery_date);
      const fromDate = new Date(filters.dateFrom);
      if (orderDate < fromDate) return false;
    }

    if (filters.dateTo && order.estimated_delivery_date) {
      const orderDate = new Date(order.estimated_delivery_date);
      const toDate = new Date(filters.dateTo);
      if (orderDate > toDate) return false;
    }

    // Filter by status (empty array = show all)
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(order.status)) return false;
    }

    return true;
  });
};
```

### 2.4: Aplicar Filtros a Orders

Antes del return, agregar:

```typescript
const filteredOrders = applyFilters(orders);
```

### 2.5: Pasar Filtered Orders a OrdersTable

Cambiar:
```typescript
<OrdersTable
  orders={orders}  // ❌ ANTES
```

Por:
```typescript
<OrdersTable
  orders={filteredOrders}  // ✅ DESPUÉS
```

### 2.6: Agregar Props a OrdersHeader

Agregar props `filters` y `setFilters` a OrdersHeader:

```typescript
<OrdersHeader
  filters={filters}
  setFilters={setFilters}
  createOrder={createOrder}
  updateOrder={updateOrder}
  isOpen={isOpen}
  openCreateOrder={handleOpenCreateOrder}
  toggleModal={toggleModal}
  selectedOrder={selectedOrder}
  finishOrder={finishOrder}
/>
```

---

## Actualización de OrdersHeader Props

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Actualizar la signature de props para recibir `filters` y `setFilters`.

### Nueva Signature de Props

```typescript
export const OrdersHeader: React.FC<{
  filters: OrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilters>>;
  isOpen: boolean;
  selectedOrder?: Order | null;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrder: (orderId: number, data: OrderFormData) => Promise<void>;
  toggleModal: () => void;
  openCreateOrder: () => void;
  finishOrder: (orderId: number) => void;
}> = ({ 
  filters,
  setFilters,
  createOrder, 
  updateOrder, 
  isOpen, 
  toggleModal, 
  selectedOrder, 
  openCreateOrder, 
  finishOrder 
}) => {
```

### Agregar Import

```typescript
import type { Order, OrderFormData, OrderFilters } from "./types";
```

**Nota**: En esta fase, OrdersHeader **todavía no usa** `filters` ni `setFilters`. Solo los recibe como props para preparar la Fase 2.

---

## Verificación de Fase 1

### Tests Funcionales

1. **No hay errores de TypeScript**: App compila sin errores
2. **App funcional**: Tabla muestra todos los pedidos (filtros todavía no aplicados visualmente)
3. **Estado creado**: `filters` existe en OrdersPage con valores iniciales correctos
4. **Función pura**: `applyFilters()` retorna array filtrado correctamente:
   - Con `filters` vacíos → retorna todos los orders
   - Con `dateFrom` → filtra orders >= fecha
   - Con `dateTo` → filtra orders <= fecha
   - Con `statuses` → filtra solo estados incluidos
5. **Props pasadas**: OrdersHeader recibe `filters` y `setFilters` sin errores

### Tests de Tipos

```typescript
// En OrdersPage, esto debe compilar:
const testFilters: OrderFilters = {
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  statuses: ["confirmed", "in_progress"],
};

const testFilters2: OrderFilters = {
  dateFrom: null,
  dateTo: null,
  statuses: [],
};
```

---

## Archivos Modificados

- ✅ `src/pages/orders/types.ts` — Agregar interface `OrderFilters`
- ✅ `src/pages/orders/OrdersPage.tsx` — Estado, lógica filtrado, props
- ✅ `src/pages/orders/OrdersHeader.tsx` — Actualizar props signature

---

## Siguiente Fase

**Fase 2**: Construir la UI del header con inputs de fecha, selector de estados, y botón de crear orden.

---

## Notas Técnicas

### ¿Por qué client-side filtering?

- **Simple**: No requiere cambios en API
- **Rápido**: Dataset pequeño (típicamente < 1000 pedidos)
- **Responsive**: Filtrado instantáneo sin network latency
- **Evolutivo**: Fácil migrar a server-side cuando crezca dataset

### ¿Por qué `estimated_delivery_date`?

- Más relevante para usuarios que `entry_date`
- Representa cuándo esperan recibir el pedido
- Natural para filtros de "próximos pedidos" o "pedidos atrasados"

### ¿Por qué array vacío = mostrar todos?

- Mejor UX: No ocultar pedidos por defecto
- Explícito: Usuario debe seleccionar estados para filtrar
- Consistente: Mismo patrón para fechas (null = sin filtro)
