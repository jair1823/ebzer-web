# Plan de Implementación: Mejoras UX para Sección de Orders

**Fecha de creación**: 21 de abril, 2026  
**Tipo**: Feature Enhancement  
**Objetivo**: Implementar filtrado inteligente por defecto + Dashboard con métricas y quick filters  
**Opción seleccionada**: Opción A (Propuesta 1 + Propuesta 2)  
**Tiempo estimado**: 4-6 horas  
**Documentación de referencia**: [docs/propuestas-orders-mejoras.md](docs/propuestas-orders-mejoras.md)

---

## 📋 Contexto del Proyecto

**Proyecto**: ebzer-web  
**Stack**: React 19.2 + TypeScript 5.9 + Vite 7.2 + Tailwind CSS 4.1  
**Domain**: Order management for custom products business  
**Backend API**: http://localhost:3000 (ver [GUIA-FRONTEND.md](GUIA-FRONTEND.md))

### Problema Actual

1. **Performance**: Se cargan TODAS las órdenes sin límite → lento con muchos pedidos
2. **UX**: Usuario no tiene contexto del estado del negocio al abrir `/orders`
3. **Data Loading**: No se aprovecha el backend que soporta filtros (`?from=` y `?to=`)

### Objetivo

Mejorar la experiencia de usuario en la sección de orders con:
1. ✅ Mostrar pedidos de los **últimos 30 días por defecto**
2. ✅ Dashboard con **métricas visuales** (pedidos activos, revenue, por cobrar, completados)
3. ✅ **Quick Filters** para vistas comunes (Activos, Pendiente Pago, Esta Semana, Este Mes)
4. ✅ Toggle "Ver Todos" para histórico completo

---

## 🎯 Alcance de Esta Implementación

### Propuesta 1: Filtrado Inteligente por Defecto

**Qué hace**:
- Por defecto carga solo pedidos de últimos 30 días (usa filtros del backend)
- Botón "Ver Todos" para cargar histórico completo
- Texto indicador: "Mostrando pedidos de los últimos 30 días"

**Archivos a modificar**:
- `src/services/orders.service.ts` - Agregar parámetros de filtro
- `src/utils/date.ts` (nuevo) - Helper para calcular rangos de fecha
- `src/hooks/useOrders.ts` - Aplicar filtro por defecto
- `src/pages/orders/OrdersPage.tsx` - Estado de vista filtrada/completa

### Propuesta 2: Dashboard con Quick Filters y Métricas

**Qué hace**:
- Cards con métricas: Pedidos Activos, Revenue Total, Por Cobrar, Completados Esta Semana
- Chips de quick filters: Todos, Activos, Pendiente Pago, Esta Semana, Este Mes
- Filtrado instantáneo al hacer click en quick filter

**Archivos nuevos**:
- `src/pages/orders/OrdersMetrics.tsx` - Componente de métricas
- `src/pages/orders/QuickFilters.tsx` - Componente de filtros rápidos
- `src/pages/orders/types.ts` - Agregar tipo `QuickFilterType`

**Archivos a modificar**:
- `src/pages/orders/OrdersPage.tsx` - Integrar métricas y quick filters

---

## 📂 Estructura de Archivos

```
src/
├── utils/
│   ├── date.ts (NUEVO)              # Helpers para manejo de fechas
│   └── index.ts                     # Exportar helpers
├── services/
│   └── orders.service.ts            # Agregar filtros opcionales
├── hooks/
│   └── useOrders.ts                 # Filtro por defecto + función sin filtros
├── pages/orders/
│   ├── types.ts                     # Agregar QuickFilterType
│   ├── OrdersMetrics.tsx (NUEVO)    # Dashboard cards
│   ├── QuickFilters.tsx (NUEVO)     # Chips de filtros
│   └── OrdersPage.tsx               # Integración completa
```

---

## 🔨 Implementación Paso a Paso

### Step 1: Crear helpers de fecha

**Archivo**: `src/utils/date.ts` (nuevo)

```typescript
/**
 * Calcula el rango de últimos 30 días en formato YYYY-MM-DD
 * Para usar con filtros del backend
 */
export const getLast30DaysRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  return {
    from: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD
    to: today.toISOString().split('T')[0]
  };
};

/**
 * Formatea una fecha para usar con la API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calcula el rango de últimos 7 días
 */
export const getLast7DaysRange = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  return {
    from: sevenDaysAgo.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0]
  };
};

/**
 * Verifica si una fecha está en el rango de últimos N días
 */
export const isWithinLastNDays = (dateString: string, days: number): boolean => {
  const date = new Date(dateString);
  const nDaysAgo = new Date();
  nDaysAgo.setDate(nDaysAgo.getDate() - days);
  
  return date >= nDaysAgo;
};
```

**Actualizar**: `src/utils/index.ts`

```typescript
// Agregar al final
export * from './date';
```

---

### Step 2: Actualizar ordersService para aceptar filtros

**Archivo**: `src/services/orders.service.ts`

**Modificación**:

Cambiar el método `getAllOrders`:

```typescript
// ANTES:
getAllOrders: async () => {
  return api.get("/orders");
},

// DESPUÉS:
getAllOrders: async (filters?: {
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
  status?: string;
}) => {
  // Construir query params si existen filtros
  const params = new URLSearchParams();
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString();
  return api.get(query ? `/orders?${query}` : '/orders');
},
```

---

### Step 3: Actualizar useOrders hook

**Archivo**: `src/hooks/useOrders.ts`

**Modificaciones**:

1. Importar helper de fecha:
```typescript
import { getLast30DaysRange } from "../utils/date";
```

2. Modificar `getAllOrders` para aceptar filtros opcionales:

```typescript
const getAllOrders = useCallback(async (serverFilters?: {
  from?: string;
  to?: string;
  status?: string;
}) => {
  setLoading(true);
  try {
    // Si no se pasan filtros, usar últimos 30 días por defecto
    const filtersToUse = serverFilters !== undefined 
      ? serverFilters 
      : getLast30DaysRange();
    
    const response = await ordersService.getAllOrders(filtersToUse);
    setOrders(response);
    
    // Cargar payment statuses solo de órdenes visibles
    await loadPaymentStatuses(response);
    
    return response;
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
}, []);
```

3. Agregar función para cargar sin filtros:

```typescript
// Nueva función para ver todas las órdenes (sin filtros)
const getAllOrdersWithoutFilters = useCallback(async () => {
  return getAllOrders({}); // Objeto vacío = sin filtros
}, [getAllOrders]);
```

4. Exportar nueva función:

```typescript
return {
  createOrder,
  getAllOrders,
  getAllOrdersWithoutFilters, // ⚠️ NUEVO
  updateOrder,
  finishOrder,
  orders,
  loading,
  selectedOrder,
  setSelectedOrder,
  paymentStatuses,
};
```

---

### Step 4: Agregar tipo QuickFilterType

**Archivo**: `src/pages/orders/types.ts`

**Agregar al final**:

```typescript
// Tipo para quick filters
export type QuickFilterType = 
  | 'all'
  | 'active'
  | 'pending_payment'
  | 'this_week'
  | 'this_month';
```

---

### Step 5: Crear componente OrdersMetrics

**Archivo**: `src/pages/orders/OrdersMetrics.tsx` (nuevo)

```typescript
import React, { useMemo } from 'react';
import type { Order, PaymentStatus } from './types';
import { formatCurrency } from '../../utils';

export const OrdersMetrics: React.FC<{
  orders: Order[];
  paymentStatuses: Map<number, PaymentStatus>;
}> = ({ orders, paymentStatuses }) => {
  const metrics = useMemo(() => {
    // Pedidos activos (no entregados ni cancelados)
    const activeOrders = orders.filter(o => 
      !['delivered', 'cancelled'].includes(o.status)
    );
    
    // Revenue total de las órdenes visibles
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount_charged, 0);
    
    // Total pendiente de cobro
    const pendingPayment = Array.from(paymentStatuses.values())
      .reduce((sum, ps) => sum + ps.remaining, 0);
    
    // Completados esta semana
    const completedThisWeek = orders.filter(o => {
      if (o.status !== 'delivered') return false;
      const updated = new Date(o.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updated >= weekAgo;
    }).length;
    
    return {
      activeOrders: activeOrders.length,
      totalRevenue,
      pendingPayment,
      completedThisWeek
    };
  }, [orders, paymentStatuses]);
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card: Pedidos Activos */}
        <div className="surface-card rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Pedidos Activos
          </p>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {metrics.activeOrders}
          </p>
          <p className="mt-1 text-xs text-secondary">
            En proceso o pendientes
          </p>
        </div>
        
        {/* Card: Revenue Total */}
        <div className="surface-card rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Revenue Total
          </p>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-secondary">
            Período actual
          </p>
        </div>
        
        {/* Card: Pendiente de Cobro */}
        <div className="surface-card rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Por Cobrar
          </p>
          <p className="mt-2 text-3xl font-semibold text-warning">
            {formatCurrency(metrics.pendingPayment)}
          </p>
          <p className="mt-1 text-xs text-secondary">
            Pagos pendientes
          </p>
        </div>
        
        {/* Card: Completados Esta Semana */}
        <div className="surface-card rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Completados
          </p>
          <p className="mt-2 text-3xl font-semibold text-success">
            {metrics.completedThisWeek}
          </p>
          <p className="mt-1 text-xs text-secondary">
            Esta semana
          </p>
        </div>
        
      </div>
    </div>
  );
};
```

**Tokens usados**:
- `surface-card` - Card con background, border y shadow
- `text-primary`, `text-secondary` - Jerarquía de texto
- `text-warning`, `text-success` - Colores semánticos para métricas

---

### Step 6: Crear componente QuickFilters

**Archivo**: `src/pages/orders/QuickFilters.tsx` (nuevo)

```typescript
import React from 'react';
import type { QuickFilterType } from './types';

export const QuickFilters: React.FC<{
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
}> = ({ activeFilter, onFilterChange }) => {
  const filters: { type: QuickFilterType; label: string; icon?: string }[] = [
    { type: 'all', label: 'Todos', icon: '📋' },
    { type: 'active', label: 'Activos', icon: '⚡' },
    { type: 'pending_payment', label: 'Pendiente Pago', icon: '💰' },
    { type: 'this_week', label: 'Esta Semana', icon: '📅' },
    { type: 'this_month', label: 'Este Mes', icon: '📆' },
  ];
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`
              inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
              transition-all duration-150
              ${
                activeFilter === filter.type
                  ? 'bg-primary-strong text-white shadow-sm'
                  : 'bg-surface-elevated text-secondary border border-subtle hover:bg-surface-hover'
              }
            `}
          >
            {filter.icon && <span>{filter.icon}</span>}
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Tokens usados**:
- `bg-primary-strong` - Color primario fuerte para estado activo
- `bg-surface-elevated` - Background para chips no seleccionados
- `border-subtle` - Border sutil
- `hover:bg-surface-hover` - Estado hover

---

### Step 7: Integrar en OrdersPage

**Archivo**: `src/pages/orders/OrdersPage.tsx`

**Modificaciones completas**:

```typescript
import React, { useMemo, useState } from "react";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import { OrdersMetrics } from "./OrdersMetrics"; // ⚠️ NUEVO
import { QuickFilters } from "./QuickFilters"; // ⚠️ NUEVO
import type { Order, OrderFilters, QuickFilterType } from "./types"; // ⚠️ Agregar QuickFilterType

import { useOrders } from "../../hooks";

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
    getAllOrdersWithoutFilters, // ⚠️ NUEVO
  } = useOrders();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    statuses: [],
  });
  
  // ⚠️ NUEVO: Estado para quick filters
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType>('this_month');
  
  // ⚠️ NUEVO: Estado para toggle "Ver Todos"
  const [showingFiltered, setShowingFiltered] = useState(true);

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

  // ⚠️ NUEVO: Handler para toggle "Ver Todos"
  const handleToggleViewAll = async () => {
    if (showingFiltered) {
      // Mostrar todos (sin filtros de fecha)
      await getAllOrdersWithoutFilters();
      setShowingFiltered(false);
    } else {
      // Volver a últimos 30 días (recarga página)
      window.location.reload();
    }
  };

  // Filtrado por fechas (existente - mantener como está)
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

  // ⚠️ NUEVO: Aplicar quick filters
  const applyQuickFilter = (orders: Order[]): Order[] => {
    switch (activeQuickFilter) {
      case 'all':
        return orders;
      
      case 'active':
        return orders.filter(o => 
          !['delivered', 'cancelled'].includes(o.status)
        );
      
      case 'pending_payment':
        return orders.filter(o => {
          const ps = paymentStatuses.get(o.id);
          return ps && !ps.is_fully_paid;
        });
      
      case 'this_week': {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orders.filter(o => 
          new Date(o.entry_date) >= weekAgo
        );
      }
      
      case 'this_month': {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return orders.filter(o => 
          new Date(o.entry_date) >= monthAgo
        );
      }
      
      default:
        return orders;
    }
  };

  // Aplicar filtros en cascada: primero quick filter, luego filtros avanzados
  const dateFilteredOrders = applyFilters(orders);
  const filteredOrders = applyQuickFilter(dateFilteredOrders);

  return (
    <div className="py-8">
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
        showingFiltered={showingFiltered} // ⚠️ NUEVO
        onToggleViewAll={handleToggleViewAll} // ⚠️ NUEVO
      />
      
      {/* ⚠️ NUEVO: Dashboard de Métricas */}
      <OrdersMetrics 
        orders={orders} 
        paymentStatuses={paymentStatuses} 
      />
      
      {/* ⚠️ NUEVO: Quick Filters */}
      <QuickFilters
        activeFilter={activeQuickFilter}
        onFilterChange={setActiveQuickFilter}
      />
      
      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        onClickRow={handleClickRow}
        finishOrder={finishOrder}
        paymentStatuses={paymentStatuses}
      />
    </div>
  );
};
```

---

### Step 8: Actualizar OrdersHeader (opcional)

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Agregar props**:

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
  showingFiltered: boolean; // ⚠️ NUEVO
  onToggleViewAll: () => void; // ⚠️ NUEVO
}> = ({ 
  filters,
  setFilters,
  createOrder, 
  updateOrder, 
  isOpen, 
  toggleModal, 
  selectedOrder, 
  openCreateOrder, 
  finishOrder,
  showingFiltered, // ⚠️ NUEVO
  onToggleViewAll, // ⚠️ NUEVO
}) => {
  // ... resto del código
  
  // ⚠️ Agregar botón "Ver Todos" en el header si quieres
  // (Opcional - puede ir en otro lugar)
};
```

**Nota**: Esta modificación es opcional. El toggle "Ver Todos" puede ir en OrdersHeader o en OrdersPage directamente (como botón flotante, por ejemplo).

---

## ✅ Verificación de Implementación

### Checklist Funcional

- [ ] **Carga por defecto**: Al abrir `/orders` se cargan solo pedidos de últimos 30 días
- [ ] **Métricas Dashboard**: Se muestran 4 cards: Activos, Revenue, Por Cobrar, Completados
- [ ] **Quick Filter "Todos"**: Muestra todos los pedidos del período actual
- [ ] **Quick Filter "Activos"**: Filtra pedidos no entregados ni cancelados
- [ ] **Quick Filter "Pendiente Pago"**: Filtra pedidos con saldo pendiente
- [ ] **Quick Filter "Esta Semana"**: Filtra pedidos de últimos 7 días
- [ ] **Quick Filter "Este Mes"**: Filtra pedidos de últimos 30 días (igual que default)
- [ ] **Toggle "Ver Todos"**: Carga histórico completo sin filtros
- [ ] **Cálculo de métricas**: Números correctos (verificar manualmente)
- [ ] **Performance**: Carga más rápida que antes (menos pedidos)

### Checklist Visual

- [ ] Cards de métricas usan tokens del sistema (`surface-card`, `text-primary`, etc.)
- [ ] Quick filters activos muestran `bg-primary-strong` con texto blanco
- [ ] Quick filters inactivos muestran `bg-surface-elevated` con border
- [ ] Hover en quick filters funciona (`hover:bg-surface-hover`)
- [ ] Layout responsive: cards en grid 2 cols (tablet) y 4 cols (desktop)
- [ ] Quick filters wrappean correctamente en mobile
- [ ] No hay colores hardcodeados (solo tokens semánticos)

### Checklist Técnico

- [ ] No hay errores de TypeScript
- [ ] No hay warnings de ESLint
- [ ] Código bien formateado (prettier)
- [ ] Imports correctos en todos los archivos
- [ ] Funciones exportadas correctamente
- [ ] useMemo usado para cálculos de métricas (performance)
- [ ] No hay console.errors en browser

### Tests Manuales

#### Test 1: Carga Inicial
1. Abrir http://localhost:5173/orders
2. **Esperado**: Se muestran métricas + quick filters + tabla con pedidos de últimos 30 días
3. **Esperado**: Quick filter "Este Mes" está seleccionado por defecto

#### Test 2: Quick Filters
1. Click en "Activos"
2. **Esperado**: Tabla muestra solo pedidos no entregados ni cancelados
3. Click en "Pendiente Pago"
4. **Esperado**: Tabla muestra solo pedidos con saldo pendiente
5. Click en "Esta Semana"
6. **Esperado**: Tabla muestra solo pedidos de últimos 7 días
7. Click en "Todos"
8. **Esperado**: Tabla muestra todos los pedidos del período actual

#### Test 3: Toggle Ver Todos
1. Verificar que hay indicador "Mostrando pedidos de los últimos 30 días"
2. Click en botón "Ver Todos"
3. **Esperado**: Se cargan todos los pedidos históricos
4. **Esperado**: Indicador desaparece o cambia
5. Click en botón "Ver Últimos 30 Días"
6. **Esperado**: Vuelve a vista filtrada

#### Test 4: Métricas
1. Contar manualmente pedidos activos en tabla
2. **Esperado**: Número coincide con card "Pedidos Activos"
3. Sumar `amount_charged` de pedidos visibles
4. **Esperado**: Total coincide con card "Revenue Total"
5. Verificar pedidos completados esta semana
6. **Esperado**: Número coincide con card "Completados"

#### Test 5: Performance
1. Network tab: verificar request a `/api/orders?from=...&to=...`
2. **Esperado**: Solo 1 request con filtros de fecha
3. **Esperado**: Response tiene solo pedidos de últimos 30 días (no todos)
4. Console: verificar que no hay múltiples llamadas innecesarias

---

## 🎨 Tokens del Sistema de Diseño

**Colores usados**:
- `surface-card` - Card con bg, border, shadow
- `bg-primary-strong` - Background fuerte para estado activo
- `bg-surface-elevated` - Background para elementos elevados
- `bg-surface-hover` - Background hover
- `text-primary` - Texto principal
- `text-secondary` - Texto secundario
- `text-warning` - Color warning (pendiente pago)
- `text-success` - Color success (completados)
- `border-subtle` - Border sutil

**Typography**:
- `text-xs` - Texto pequeño
- `text-sm` - Texto normal
- `text-3xl` - Números grandes (métricas)
- `font-medium` - Peso medio
- `font-semibold` - Peso semi-bold
- `uppercase` - Mayúsculas
- `tracking-wide` - Espaciado de letras

**Layout**:
- `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` - Grid responsive
- `rounded-xl` - Bordes redondeados
- `px-4 py-5` - Padding
- `flex flex-wrap gap-2` - Flexbox con wrap

---

## 📦 Dependencias

**No se agregan nuevas dependencias**. Todo se construye con lo existente:
- React (existente)
- TypeScript (existente)
- Tailwind CSS (existente)
- Tokens del sistema (`src/index.css`)

---

## 🚨 Posibles Issues y Soluciones

### Issue 1: Métricas no se actualizan al cambiar quick filter

**Causa**: `OrdersMetrics` recibe `orders` sin filtrar  
**Solución**: Pasar `filteredOrders` en lugar de `orders` al componente

### Issue 2: Payment statuses no están disponibles

**Causa**: `paymentStatuses` Map está vacío o no se cargó  
**Solución**: Verificar que `loadPaymentStatuses()` se ejecuta correctamente en `useOrders`

### Issue 3: Quick filter "Pendiente Pago" muestra todos

**Causa**: `paymentStatuses.get(o.id)` retorna undefined  
**Solución**: Asegurar que payment statuses se cargan antes de aplicar filtro

### Issue 4: Toggle "Ver Todos" no funciona

**Causa**: `getAllOrdersWithoutFilters` no está exportado de useOrders  
**Solución**: Verificar export en `src/hooks/useOrders.ts`

### Issue 5: Colores hardcodeados

**Causa**: Se usaron clases como `bg-red-500` en lugar de tokens  
**Solución**: Reemplazar por tokens semánticos (`bg-danger`, `text-warning`, etc.)

---

## 📚 Recursos de Referencia

### Archivos Importantes

- [src/index.css](src/index.css) - Tokens del sistema
- [docs/design-tokens.md](docs/design-tokens.md) - Guía de uso de tokens
- [GUIA-FRONTEND.md](GUIA-FRONTEND.md) - Documentación API backend
- [docs/propuestas-orders-mejoras.md](docs/propuestas-orders-mejoras.md) - Propuestas completas

### Endpoints Backend Usados

```bash
# Obtener órdenes con filtros de fecha
GET http://localhost:3000/api/orders?from=2026-03-22&to=2026-04-21

# Obtener payment status de una orden
GET http://localhost:3000/api/orders/:id/payment-status
```

### Ejemplos de Uso

**formatCurrency** (existente en utils):
```typescript
import { formatCurrency } from '../../utils';
formatCurrency(1000.50); // "$1,000.50"
```

**isWithinLastNDays** (nuevo):
```typescript
import { isWithinLastNDays } from '../../utils/date';
isWithinLastNDays('2026-04-15T10:00:00Z', 7); // true si es de última semana
```

---

## 🎯 Resultado Esperado

### Antes
- Usuario abre `/orders` → ve 1000 pedidos históricos mezclados
- Carga lenta
- Sin contexto del negocio

### Después
- Usuario abre `/orders` → ve dashboard con métricas
- 4 cards con insights: Activos, Revenue, Por Cobrar, Completados
- Quick filters para vistas comunes
- Solo últimos 30 días por defecto → carga rápida
- Botón "Ver Todos" para histórico si necesita
- Sensación de app profesional

---

## ⏱️ Tiempo Estimado por Step

- **Step 1** (date helpers): 15 min
- **Step 2** (ordersService): 15 min
- **Step 3** (useOrders hook): 30 min
- **Step 4** (tipo QuickFilterType): 5 min
- **Step 5** (OrdersMetrics): 1 hora
- **Step 6** (QuickFilters): 45 min
- **Step 7** (OrdersPage integración): 1 hora
- **Step 8** (OrdersHeader opcional): 30 min
- **Verificación y tests**: 1 hora

**Total**: 4-6 horas

---

## 🚀 Próximos Pasos (Futuro)

Mejoras adicionales que pueden agregarse después:

1. **Propuesta 3**: Búsqueda instantánea + paginación
2. **Persistencia**: Guardar quick filter seleccionado en localStorage
3. **Export**: Exportar pedidos filtrados a CSV
4. **Gráficas**: Chart de revenue mensual
5. **Notificaciones**: Badge "3 pedidos sin pagar" en navbar
6. **Sorting**: Click en headers de tabla para ordenar columnas

---

**Fin del plan de implementación**  
¿Listo para comenzar? 🚀
