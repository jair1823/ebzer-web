# Deprecación: IncomesPage

> **Estado**: DEPRECADO  
> **Fecha**: 21 de abril, 2026  
> **Razón**: Reemplazo por vista integrada en Orders  
> **Alternativa**: Ver estado de pago en OrdersTable y CreateOrderForm

---

## Resumen del Cambio

La página independiente de **Incomes** (`src/pages/incomes/IncomesPage.tsx`) ha sido **deprecada** en favor de una vista integrada directamente en el módulo de **Orders**.

### ¿Por qué se deprecó?

La tabla de incomes mostraba una **lista plana de pagos** sin contexto, lo cual:

- ❌ No permite identificar rápidamente qué órdenes tienen pagos pendientes
- ❌ Requiere navegación innecesaria entre páginas
- ❌ No facilita la toma de decisiones operacionales
- ❌ Viola el principio de "información en contexto"

### Nueva Arquitectura: Vista Centrada en Órdenes

Los pagos ahora se visualizan **donde importan**:

#### 1. **En OrdersTable** (Vista de Lista)
- Nueva columna **"Estado de Pago"** con badges visuales:
  - 🟢 Verde: Pagado completo (100%)
  - 🟡 Amarillo: Pago parcial (1-99%)
  - 🔴 Rojo: Sin pagos (0%)
- Nueva columna **"Monto"** mostrando el `amount_charged`

#### 2. **En CreateOrderForm** (Vista de Detalle)
- Card de **"Estado de Pago"** con:
  - Badge de estado
  - Porcentaje pagado (%)
  - Progress bar visual
  - Total cobrado vs Por cobrar
- Sección **"Pagos recibidos"** (OrderPaymentsSection) para gestionar incomes

---

## Cambios Técnicos Implementados

### Archivos Nuevos

- **`src/utils/payment-status.ts`**: Utilidades para cálculo y formateo de payment status
  - `calculatePaymentStatus()`: Calcula estado de pago a partir de incomes
  - `getPaymentBadgeClasses()`: Clases CSS según porcentaje
  - `getPaymentBadgeText()`: Texto del badge
  - `formatRemainingAmount()`: Formateo de monto restante

### Archivos Modificados

- **`src/hooks/useOrders.ts`**:
  - Agregado estado: `paymentStatuses: Map<number, PaymentStatus>`
  - Nueva función: `loadPaymentStatuses()` - Carga payment statuses en paralelo
  - Nueva función: `getPaymentStatusForOrder(orderId)` - Obtiene status de orden específica
  - Modificado `getAllOrders()` para llamar a `loadPaymentStatuses()` automáticamente

- **`src/pages/orders/OrdersTable.tsx`**:
  - Nueva prop: `paymentStatuses: Map<number, PaymentStatus>`
  - Nueva columna: "Estado de Pago" (badges con colores)
  - Nueva columna: "Monto" (amount_charged formateado)
  - Actualizado `colspan` en loading state (5 → 7)

- **`src/pages/orders/OrdersPage.tsx`**:
  - Agrega `paymentStatuses` del hook y lo pasa a `OrdersTable`

- **`src/pages/orders/CreateOrderForm.tsx`**:
  - Importadas funciones de `payment-status.ts`
  - Agregado cálculo en tiempo real: `paymentStatus = calculatePaymentStatus(...)`
  - Nueva sección: Card de "Estado de Pago" con progress bar y métricas

---

## Estado Actual de IncomesPage

### ⚠️ Marcado como Deprecado

La página **NO se ha eliminado** del código para permitir validación con usuarios. Se mantiene temporalmente como fallback.

**Ubicación**: `src/pages/incomes/IncomesPage.tsx`

**Componentes relacionados**:
- `IncomesHeader.tsx`
- `IncomesTable.tsx`
- `CreateIncomeForm.tsx`
- Hook: `useIncomes.ts`
- Servicio: `incomes.service.ts`

**Nota**: Los servicios de API de incomes (`incomesService`) **sí se siguen usando** en `CreateOrderForm` para crear/editar/eliminar incomes.

---

## Migración para Desarrolladores

Si estabas usando `IncomesPage` o navegando a `/incomes`:

### ❌ ANTES (Deprecado)
```tsx
// Navegación a página de incomes
<Link to="/incomes">Ver pagos</Link>

// Ver lista de todos los incomes
<IncomesPage />
```

### ✅ AHORA (Recomendado)
```tsx
// Ver estado de pago en tabla de órdenes
<OrdersTable 
  orders={orders}
  paymentStatuses={paymentStatuses}
  // ...
/>

// Ver detalles de pago de una orden específica
<CreateOrderForm 
  selectedOrder={order}
  // El card de Estado de Pago se muestra automáticamente
/>
```

---

## Roadmap Futuro

### Opción B: Dashboard Financiero (Pendiente)

Si se requiere una **vista consolidada financiera**, se implementará:

- Métricas del período (Total facturado, cobrado, pendiente)
- Agrupación por estado de pago
- Filtros por fecha
- Exportación de reportes

Ver: [`docs/TODO-opcion-b-dashboard-financiero.md`](./TODO-opcion-b-dashboard-financiero.md)

---

## Validación

### Checklist de Validación

- [x] Columna "Estado de Pago" en OrdersTable renderiza correctamente
- [x] Columna "Monto" en OrdersTable muestra amount_charged
- [x] Card de "Estado de Pago" en CreateOrderForm calcula en tiempo real
- [x] Progress bar refleja percentage_paid correctamente
- [x] Badges usan colores del design system
- [ ] Validar con usuarios que nueva UI cubre necesidades
- [ ] Decidir si eliminar IncomesPage o implementar Opción B

---

## Preguntas Frecuentes

### ¿Se eliminó el endpoint GET /api/incomes?
**No**. El endpoint sigue disponible y funcional. Solo cambió la UI frontend.

### ¿Puedo seguir creando incomes desde el código?
**Sí**. El servicio `incomesService` sigue disponible y se usa en `CreateOrderForm`.

### ¿Dónde registro nuevos pagos ahora?
En el modal de **CreateOrderForm** (al editar una orden), en la sección **"Pagos recibidos"** (componente `OrderPaymentsSection`).

### ¿Cómo veo cuánto falta por cobrar de una orden?
En la columna **"Estado de Pago"** de `OrdersTable`, o en el card **"Estado de Pago"** del modal de detalle.

### ¿Se perdió funcionalidad?
No. Se **recontextualizó**. Toda la funcionalidad de ver/crear/editar incomes sigue disponible, pero ahora en el contexto correcto (dentro de la orden).

---

## Soporte

Si encuentras problemas con la nueva implementación:

1. Revisa este documento
2. Consulta el plan original en `/memories/session/plan.md`
3. Revisa el código de utilidades en `src/utils/payment-status.ts`
4. Reporta issues en el sistema de tracking del proyecto

---

**Documentado por**: Planning & Implementation Agent  
**Fecha**: 21 de abril, 2026  
**Versión**: 1.0
