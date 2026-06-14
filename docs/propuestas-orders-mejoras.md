# Propuestas de Mejora: Sección de Orders

**Fecha**: 21 de abril, 2026  
**Objetivo Principal**: Mostrar pedidos de los últimos 30 días por defecto  
**Contexto**: Sistema actualmente carga TODAS las órdenes sin filtros, puede ser pesado con el tiempo  

---

## 🎯 Análisis del Estado Actual

### Problemas Identificados

1. **Performance**: Se cargan TODAS las órdenes sin límite
   - Con 1000+ órdenes, la app se volverá lenta
   - Se cargan payment statuses de TODAS las órdenes en paralelo (costoso)

2. **UX**: Usuario ve todas las órdenes históricas sin contexto
   - Difícil encontrar pedidos recientes
   - No hay forma rápida de filtrar pedidos activos vs completados

3. **Data Loading**: No se aprovecha el backend que soporta filtros
   - API soporta `?from=` y `?to=` pero no se usan
   - Se filtra client-side cuando podría ser server-side

### Código Actual Relevante

```typescript
// src/hooks/useOrders.ts - Línea 20
const getAllOrders = useCallback(async () => {
  setLoading(true);
  try {
    const response = await ordersService.getAllOrders(); // ❌ Trae TODO
    setOrders(response);
    
    await loadPaymentStatuses(response); // ❌ Carga payment status de TODO
    
    return response;
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
}, []);
```

---

## 📊 Propuesta 1: Filtrado Inteligente por Defecto (Pragmática)

### Valor que Agrega

✅ **Performance mejorada**: Solo carga pedidos relevantes (últimos 30 días)  
✅ **UX inmediata**: Usuario ve pedidos recientes al abrir la página  
✅ **Fácil implementación**: Cambios mínimos, usa API existente  
✅ **Escalable**: Funciona con 10 o 10,000 pedidos históricos  

### Cambios Técnicos

#### 1. Actualizar `ordersService.getAllOrders()` para aceptar filtros opcionales

```typescript
// src/services/orders.service.ts
export const ordersService = {
  getAllOrders: async (filters?: {
    from?: string;  // YYYY-MM-DD
    to?: string;    // YYYY-MM-DD
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return api.get(query ? `/orders?${query}` : '/orders');
  },
  // ... resto de métodos
};
```

#### 2. Agregar helper para calcular fecha de "últimos 30 días"

```typescript
// src/utils/date.ts (nuevo archivo)
export const getLast30DaysRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  return {
    from: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD
    to: today.toISOString().split('T')[0]
  };
};

export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
```

#### 3. Actualizar `useOrders` para aplicar filtro por defecto

```typescript
// src/hooks/useOrders.ts
import { getLast30DaysRange } from "../utils/date";

export const useOrders = () => {
  // ... estado existente
  
  const getAllOrders = useCallback(async (serverFilters?: {
    from?: string;
    to?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      // Por defecto: últimos 30 días
      const defaultFilters = getLast30DaysRange();
      const filtersToUse = serverFilters || defaultFilters;
      
      const response = await ordersService.getAllOrders(filtersToUse);
      setOrders(response);
      
      // Solo cargar payment statuses de órdenes visibles
      await loadPaymentStatuses(response);
      
      return response;
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Nuevo: función para limpiar filtros (ver todos)
  const getAllOrdersWithoutFilters = useCallback(async () => {
    return getAllOrders({}); // Sin filtros = backend retorna todo
  }, [getAllOrders]);
  
  return {
    // ... resto
    getAllOrders,
    getAllOrdersWithoutFilters, // Exportar nueva función
  };
};
```

#### 4. Agregar toggle "Ver Todos" en OrdersHeader

```tsx
// src/pages/orders/OrdersHeader.tsx
export const OrdersHeader: React.FC<{
  showingFiltered: boolean;
  onToggleViewAll: () => void;
  // ... otras props
}> = ({ showingFiltered, onToggleViewAll, ... }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Pedidos</h1>
          {showingFiltered && (
            <p className="mt-1 text-sm text-secondary">
              Mostrando pedidos de los últimos 30 días
            </p>
          )}
        </div>
        
        <button
          onClick={onToggleViewAll}
          className="btn-base btn-outline text-sm"
        >
          {showingFiltered ? 'Ver Todos' : 'Ver Últimos 30 Días'}
        </button>
      </div>
    </div>
  );
};
```

#### 5. Conectar en OrdersPage

```typescript
// src/pages/orders/OrdersPage.tsx
export const OrdersPage: React.FC = () => {
  const { orders, loading, getAllOrders, getAllOrdersWithoutFilters, ... } = useOrders();
  const [showingFiltered, setShowingFiltered] = useState(true);
  
  const handleToggleViewAll = async () => {
    if (showingFiltered) {
      // Mostrar todos
      await getAllOrdersWithoutFilters();
      setShowingFiltered(false);
    } else {
      // Volver a últimos 30 días
      await getAllOrders(); // usa filtro por defecto
      setShowingFiltered(true);
    }
  };
  
  return (
    <div className="py-8">
      <OrdersHeader
        showingFiltered={showingFiltered}
        onToggleViewAll={handleToggleViewAll}
        // ... otras props
      />
      <OrdersTable orders={orders} loading={loading} ... />
    </div>
  );
};
```

### Impacto en UX

**Antes**:
- Usuario abre `/orders` → ve 1000 pedidos históricos mezclados
- Difícil encontrar pedidos recientes
- Lento al cargar

**Después**:
- Usuario abre `/orders` → ve solo últimos 30 días (~20-50 pedidos)
- Carga rápida
- Botón "Ver Todos" si necesita histórico completo
- Texto claro: "Mostrando pedidos de los últimos 30 días"

### Complejidad de Implementación

- **Tiempo estimado**: 1-2 horas
- **Archivos modificados**: 4 archivos
- **Tests necesarios**: Verificar que filtro funciona, botón toggle funciona
- **Riesgo**: Bajo (cambios pequeños, bien delimitados)

### Pros y Contras

**Pros**:
- ✅ Implementación rápida
- ✅ Mejora inmediata de performance
- ✅ UX clara y simple
- ✅ Compatible con plan de filtros (Fase 1-3)

**Contras**:
- ❌ Usuario necesita click extra para ver histórico
- ❌ No es una mejora visual dramática

---

## 🎨 Propuesta 2: Dashboard con Quick Filters y Métricas (UX Rica)

### Valor que Agrega

✅ **Vista ejecutiva**: Métricas clave al inicio (pedidos activos, revenue, etc.)  
✅ **Quick Filters**: Accesos rápidos a vistas comunes ("Activos", "Pendientes de Pago", "Esta Semana")  
✅ **UX Premium**: Sensación de app profesional con insights visuales  
✅ **Toma de decisiones**: Usuario entiende el estado del negocio de un vistazo  

### Cambios Técnicos

#### 1. Crear componente `OrdersMetrics` (Dashboard Cards)

```tsx
// src/pages/orders/OrdersMetrics.tsx
import React, { useMemo } from 'react';
import type { Order, PaymentStatus } from './types';

export const OrdersMetrics: React.FC<{
  orders: Order[];
  paymentStatuses: Map<number, PaymentStatus>;
}> = ({ orders, paymentStatuses }) => {
  const metrics = useMemo(() => {
    const activeOrders = orders.filter(o => 
      !['delivered', 'cancelled'].includes(o.status)
    );
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount_charged, 0);
    
    const pendingPayment = Array.from(paymentStatuses.values())
      .reduce((sum, ps) => sum + ps.remaining, 0);
    
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
          ${metrics.totalRevenue.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-secondary">
          Últimos 30 días
        </p>
      </div>
      
      {/* Card: Pendiente de Cobro */}
      <div className="surface-card rounded-xl p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-secondary">
          Por Cobrar
        </p>
        <p className="mt-2 text-3xl font-semibold text-warning">
          ${metrics.pendingPayment.toLocaleString()}
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
  );
};
```

#### 2. Crear componente `QuickFilters` (Chips de acceso rápido)

```tsx
// src/pages/orders/QuickFilters.tsx
import React from 'react';

type QuickFilterType = 
  | 'all'
  | 'active'
  | 'pending_payment'
  | 'this_week'
  | 'this_month';

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
    <div className="flex flex-wrap gap-2 mb-4">
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
  );
};
```

#### 3. Lógica de filtrado en OrdersPage

```typescript
// src/pages/orders/OrdersPage.tsx
import { OrdersMetrics } from './OrdersMetrics';
import { QuickFilters } from './QuickFilters';
import type { QuickFilterType } from './QuickFilters';

export const OrdersPage: React.FC = () => {
  const { orders, loading, ... } = useOrders();
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType>('this_month');
  
  // Aplicar quick filter
  const filteredOrders = useMemo(() => {
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
  }, [orders, activeQuickFilter, paymentStatuses]);
  
  return (
    <div className="py-8">
      <OrdersHeader ... />
      
      {/* Métricas Dashboard */}
      <OrdersMetrics 
        orders={orders} 
        paymentStatuses={paymentStatuses} 
      />
      
      {/* Quick Filters */}
      <QuickFilters
        activeFilter={activeQuickFilter}
        onFilterChange={setActiveQuickFilter}
      />
      
      <OrdersTable orders={filteredOrders} loading={loading} ... />
    </div>
  );
};
```

### Impacto en UX

**Antes**:
- Usuario abre `/orders` → solo ve tabla de pedidos
- No tiene contexto del estado del negocio
- Necesita contar manualmente pedidos activos

**Después**:
- Usuario abre `/orders` → ve dashboard con métricas clave
- Un vistazo: "15 pedidos activos, $12,500 por cobrar"
- Click en "Activos" → filtra solo pedidos en progreso
- Click en "Pendiente Pago" → ve solo pedidos con saldo pendiente
- Sensación de app profesional

### Complejidad de Implementación

- **Tiempo estimado**: 3-4 horas
- **Archivos nuevos**: 2 componentes (OrdersMetrics, QuickFilters)
- **Archivos modificados**: OrdersPage, OrdersHeader (opcional)
- **Tests necesarios**: Verificar cálculos de métricas, quick filters
- **Riesgo**: Medio (más componentes, más lógica, pero bien delimitado)

### Pros y Contras

**Pros**:
- ✅ UX Premium: sensación de app profesional
- ✅ Insights visuales: usuario ve estado del negocio de un vistazo
- ✅ Quick Filters: accesos rápidos a vistas comunes
- ✅ Engagement: usuario interactúa más con la app

**Contras**:
- ❌ Más código para mantener
- ❌ Cálculo de métricas puede ser costoso con muchos pedidos (necesita optimización)
- ❌ Puede distraer de la tabla principal si no se diseña bien

---

## 🔍 Propuesta 3: Búsqueda Instantánea + Paginación (Escalable)

### Valor que Agrega

✅ **Búsqueda rápida**: Encuentra pedidos por cliente, descripción, o ID  
✅ **Paginación**: Maneja fácilmente miles de pedidos  
✅ **Performance**: Solo carga 20-50 pedidos a la vez  
✅ **Escalable**: Funciona con 100 o 100,000 pedidos  

### Cambios Técnicos

#### 1. Agregar campo de búsqueda en OrdersHeader

```tsx
// src/pages/orders/OrdersHeader.tsx
export const OrdersHeader: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // ... otras props
}> = ({ searchQuery, onSearchChange, ... }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por cliente, descripción, o ID..."
              className="input-base pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              🔍
            </span>
          </div>
        </div>
        
        <button className="btn-base btn-secondary">
          Nuevo Pedido
        </button>
      </div>
    </div>
  );
};
```

#### 2. Lógica de búsqueda en OrdersPage

```typescript
// src/pages/orders/OrdersPage.tsx
export const OrdersPage: React.FC = () => {
  const { orders, loading, ... } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // Filtrar por búsqueda
  const searchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(order => {
      const matchesId = order.id.toString().includes(query);
      const matchesClient = order.client_name?.toLowerCase().includes(query);
      const matchesDescription = order.description.toLowerCase().includes(query);
      const matchesPhone = order.client_phone?.includes(query);
      
      return matchesId || matchesClient || matchesDescription || matchesPhone;
    });
  }, [orders, searchQuery]);
  
  // Paginación
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return searchedOrders.slice(start, end);
  }, [searchedOrders, currentPage]);
  
  const totalPages = Math.ceil(searchedOrders.length / ITEMS_PER_PAGE);
  
  // Reset a página 1 cuando cambia búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  return (
    <div className="py-8">
      <OrdersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Resultados de búsqueda */}
      {searchQuery && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <p className="text-sm text-secondary">
            {searchedOrders.length} resultado{searchedOrders.length !== 1 ? 's' : ''} 
            para "{searchQuery}"
          </p>
        </div>
      )}
      
      <OrdersTable orders={paginatedOrders} loading={loading} ... />
      
      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
```

#### 3. Componente de Paginación

```tsx
// src/components/Pagination.tsx
export const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-base btn-outline disabled:opacity-50"
      >
        ← Anterior
      </button>
      
      <span className="text-sm text-secondary px-4">
        Página {currentPage} de {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-base btn-outline disabled:opacity-50"
      >
        Siguiente →
      </button>
    </div>
  );
};
```

### Impacto en UX

**Antes**:
- Usuario necesita scroll infinito para encontrar un pedido
- Difícil ubicar pedido de "María" entre 500 pedidos

**Después**:
- Usuario escribe "María" → filtrado instantáneo
- Solo 20 pedidos por página → carga rápida
- Navegación clara entre páginas

### Complejidad de Implementación

- **Tiempo estimado**: 2-3 horas
- **Archivos nuevos**: 1 componente (Pagination)
- **Archivos modificados**: OrdersPage, OrdersHeader
- **Tests necesarios**: Búsqueda funciona, paginación funciona
- **Riesgo**: Bajo-Medio (lógica simple pero varios casos edge)

### Pros y Contras

**Pros**:
- ✅ Escalable: funciona con miles de pedidos
- ✅ UX familiar: búsqueda + paginación es patrón conocido
- ✅ Performance: solo renderiza 20 items a la vez
- ✅ Útil: usuario encuentra pedidos rápidamente

**Contras**:
- ❌ Paginación puede ser menos moderna que scroll infinito
- ❌ Búsqueda client-side (podría ser server-side para mejor performance)
- ❌ No agrega insights visuales como Propuesta 2

---

## 🏆 Recomendación Final

### Opción A: Implementar Propuesta 1 + Propuesta 2 (Mejor UX)

**Por qué**:
- Propuesta 1 (filtro por defecto) soluciona el objetivo #1 directamente
- Propuesta 2 (dashboard + quick filters) agrega valor UX significativo
- Ambas son compatibles y se complementan
- Tiempo total: ~4-6 horas (asumible en 1 día)

**Resultado**:
- ✅ Pedidos de últimos 30 días por defecto
- ✅ Dashboard con métricas visuales
- ✅ Quick filters para vistas comunes
- ✅ Toggle "Ver Todos" para histórico

---

### Opción B: Implementar Propuesta 1 + Propuesta 3 (Más Pragmático)

**Por qué**:
- Propuesta 1 soluciona objetivo #1
- Propuesta 3 (búsqueda + paginación) es más escalable
- Menos "wow" visual pero más útil a largo plazo
- Tiempo total: ~3-5 horas

**Resultado**:
- ✅ Pedidos de últimos 30 días por defecto
- ✅ Búsqueda instantánea
- ✅ Paginación para escalar
- ✅ Toggle "Ver Todos"

---

### Opción C: Implementar las 3 Propuestas (Máximo Valor)

**Por qué**:
- Propuesta 1: filtro por defecto (base)
- Propuesta 2: dashboard + quick filters (UX)
- Propuesta 3: búsqueda + paginación (escalabilidad)
- Tiempo total: ~6-9 horas (asumible en 1.5-2 días)

**Resultado**:
- ✅ Pedidos de últimos 30 días por defecto
- ✅ Dashboard con métricas
- ✅ Quick filters
- ✅ Búsqueda instantánea
- ✅ Paginación
- ✅ Toggle "Ver Todos"

**App profesional completa** 🎯

---

## 📋 Próximos Pasos Sugeridos

1. **Validar con usuario**: ¿Qué propuesta prefiere? ¿Opción A, B, o C?
2. **Priorizar**: Si tiempo limitado → Opción B (pragmático)
3. **Implementar**: Seguir orden de propuestas (1 → 2 → 3)
4. **Iterar**: Agregar features según feedback real

---

**¿Cuál opción prefieres implementar?**
