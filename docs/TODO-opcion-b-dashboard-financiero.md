# TODO: Opción B - Dashboard Financiero

> **Estado**: Pendiente de implementación  
> **Prioridad**: Media  
> **Prerequisito**: Completar Opción A (Vista Centrada en Órdenes) ✅  
> **Fecha de creación**: 21 de abril, 2026

---

## 📊 Descripción

Transformar la página actual de Incomes en un **Dashboard Financiero** que agrupe y visualice datos de forma útil para toma de decisiones de negocio.

### Problema que Resuelve

Después de implementar la Opción A, la visualización de pagos estará integrada en Orders. Sin embargo, aún falta una **vista consolidada financiera** que responda preguntas como:

- ¿Cuánto he cobrado este mes?
- ¿Qué órdenes tienen mayor deuda pendiente?
- ¿Cuál es mi flujo de caja proyectado?
- ¿Qué porcentaje de mis ventas está cobrado?

---

## 🎯 Objetivo

Crear un dashboard que muestre:

### 1. **Métricas Clave** (Cards superiores)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Facturado   │  │ Cobrado     │  │ Pendiente   │  │ % Cobrado   │
│ $8,000      │  │ $5,200      │  │ $2,800      │  │ 65%         │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2. **Órdenes Agrupadas por Estado de Pago**
- **Completamente pagadas** (lista colapsable)
- **Pago parcial** (con progress bar y botón "Ver detalle")
- **Sin pagos** (destacar como urgentes)

### 3. **Últimos Movimientos**
- Historial de pagos recibidos (últimos 10)
- Fecha, orden asociada, monto
- Click para navegar a la orden

### 4. **Filtros y Acciones**
- Selector de período (Abril 2026, Último mes, Personalizado)
- Checkbox "Solo órdenes pendientes"
- Botón "Exportar reporte" (CSV o PDF)

---

## 🏗️ Arquitectura Propuesta

### Componentes Nuevos

```
src/pages/financials/
├── FinancialsPage.tsx           # Container principal
├── FinancialMetricsCards.tsx    # 4 cards de métricas
├── OrdersByPaymentStatus.tsx    # Agrupación de órdenes
├── RecentPaymentsTable.tsx      # Últimos movimientos
└── types.ts                     # FinancialMetrics, GroupedOrders
```

### Hooks Nuevos

```typescript
// src/hooks/useFinancials.ts
interface FinancialMetrics {
  totalCharged: number;
  totalPaid: number;
  totalRemaining: number;
  percentagePaid: number;
}

interface GroupedOrders {
  fullyPaid: Order[];
  partiallyPaid: Order[];
  unpaid: Order[];
}

function useFinancials(filters: DateRange) {
  // Fetch orders + payment statuses
  // Calcular métricas agregadas
  // Agrupar órdenes por estado de pago
  return { metrics, groupedOrders, loading };
}
```

### Servicios API

Posiblemente agregar endpoint en backend:
```
GET /api/financial-summary?from=2026-04-01&to=2026-04-30
Response: {
  total_charged: 8000,
  total_paid: 5200,
  total_remaining: 2800,
  orders_by_status: { fully_paid: [...], partial: [...], unpaid: [...] }
}
```

**Nota**: Si el backend no implementa esto, calcular en frontend con llamadas existentes.

---

## 📋 Fases de Implementación (Tentativo)

### Fase 1: Métricas y Agrupación Básica
1. Crear `FinancialsPage` reemplazando `IncomesPage`
2. Implementar `useFinancials` hook
3. Mostrar 4 cards de métricas
4. Agrupar órdenes por estado (sin UI fancy)

### Fase 2: UI Rica
5. Implementar `OrdersByPaymentStatus` con colapsables
6. Progress bars para pagos parciales
7. Badges y estados visuales

### Fase 3: Historial y Filtros
8. Tabla de últimos pagos (`RecentPaymentsTable`)
9. Filtros por período
10. Navegación a detalles de orden

### Fase 4: Exportación y Analytics
11. Exportar a CSV
12. Gráfico de flujo de caja (opcional)
13. Proyecciones (opcional)

---

## 🎨 Mockup de Referencia

```
┌────────────────────────────────────────────────────────┐
│ Dashboard Financiero - Abril 2026                      │
│ [Abril 2026 ▼] [Solo pendientes ☐] [Exportar reporte] │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│ │Facturado │  │ Cobrado  │  │Pendiente │  │%Cobrado ││
│ │ $8,000   │  │ $5,200   │  │ $2,800   │  │  65%    ││
│ └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                        │
│ ┌─── Órdenes por Estado de Pago ──────────────────┐  │
│ │                                                  │  │
│ │ ✓ Completamente pagadas (3) [Mostrar ▼]        │  │
│ │                                                  │  │
│ │ ⚠ Pago parcial (2)                              │  │
│ │   ├─ #123 María López  │████░░░│ 60% [Ver]     │  │
│ │   └─ #122 Juan Pérez   │███░░░░│ 40% [Ver]     │  │
│ │                                                  │  │
│ │ ⚪ Sin pagos (1)                                 │  │
│ │   └─ #124 Ana García   │░░░░░░░│ 0%  [Ver]     │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌─── Últimos Pagos Recibidos ─────────────────────┐  │
│ │ 20/04 - $300  Orden #123 (María López)     [→] │  │
│ │ 19/04 - $500  Orden #123 (María López)     [→] │  │
│ │ 18/04 - $1200 Orden #118 (Carlos Ruiz)     [→] │  │
│ └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Valor Agregado vs Opción A

| Aspecto | Opción A | Opción B (Dashboard) |
|---------|----------|---------------------|
| Ver estado de pago por orden | ✅ | ✅ |
| Agregar pagos en contexto | ✅ | ❌ (solo visualización) |
| **Métricas consolidadas** | ❌ | ✅ |
| **Vista financiera del período** | ❌ | ✅ |
| **Identificar deudas urgentes** | Parcial | ✅ |
| **Exportar reportes** | ❌ | ✅ |
| **Análisis de flujo de caja** | ❌ | ✅ (futuro) |

**Conclusión**: Opción B complementa Opción A, no la reemplaza.

---

## 🚀 Cuándo Implementar

**Prerequisitos**:
1. ✅ Opción A completada y validada
2. Usuarios confirman que necesitan vista consolidada
3. Backend estable (o crear endpoint agregado)

**Prioridad**:
- **Alta** si negocio requiere reportes financieros frecuentes
- **Media** si solo para consultas esporádicas
- **Baja** si Opción A cubre necesidades actuales

**Esfuerzo Estimado**: 5-8 días (completo, incluyendo testing)

---

## 📚 Referencias

- ✅ [Plan Opción A](../memories/session/plan.md) - Completado
- ✅ [Deprecación IncomesPage](./deprecation-incomes-page.md) - Documentado
- [GUIA-FRONTEND.md](../GUIA-FRONTEND.md) - Endpoints de API
- [arquitectura.md](./arquitectura.md) - Patrones del proyecto
- [design-tokens.md](./design-tokens.md) - Guía visual

---

## 🔖 Notas

- Este es un TODO, NO un plan de implementación detallado
- Cuando se decida implementar, crear plan específico como se hizo con Opción A
- Considerar feedback de usuarios después de Opción A antes de invertir esfuerzo aquí

**Creado**: 21 de abril, 2026  
**Autor**: Planning & Implementation Agent
