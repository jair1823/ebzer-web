# Fase 2: UI del Header con Filtros y Acciones

**Objetivo**: Rediseñar completamente OrdersHeader para incluir título, filtros de fecha, selector de estados, y botón de crear orden.

**Prerequisitos**: Fase 1 completada (tipos `OrderFilters` y estado en OrdersPage).

**Contexto**: Actualmente OrdersHeader tiene un div vacío con `{/* todo filters */}` y el botón de crear orden está dentro de CreateOrderForm. Vamos a crear una interfaz completa de filtrado usando los tokens del sistema de diseño.

---

## Alcance de esta Fase

Esta fase construye la UI del header completo con:
- Título "Pedidos" + descripción
- Inputs de fecha (desde/hasta)
- Selector de estados (botones toggle)
- Botón "Nuevo pedido" migrado desde CreateOrderForm

**NO** incluye: indicador de filtros activos, botón limpiar filtros, ni responsive (eso es Fase 3).

---

## Step 3: Rediseñar OrdersHeader - Estructura Base

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Reemplazar el contenido actual por una estructura completa de header.

### Estructura HTML Propuesta

```tsx
export const OrdersHeader: React.FC<{...}> = ({ 
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
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header Container */}
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        
        {/* Title Section */}
        <div className="border-b px-6 py-5 border-subtle">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-primary">
                Pedidos
              </h1>
              <p className="mt-1 text-sm text-secondary">
                Gestiona y da seguimiento a todos los pedidos del taller.
              </p>
            </div>
            
            {/* Botón Nuevo Pedido - Step 6 */}
            <button
              type="button"
              className="btn-base btn-secondary focus-ring rounded-md shadow-md"
              onClick={openCreateOrder}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <g className="stroke-slate-600" strokeLinecap="round" strokeWidth="3">
                  <path d="M12 19V5" />
                  <path d="M19 12H5" />
                </g>
              </svg>
              Nuevo pedido
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
            
            {/* Date Inputs - Step 4 */}
            {/* Status Selector - Step 5 */}
            
          </div>
        </div>

      </div>

      {/* Modal - mantener como está */}
      <CreateOrderForm
        isOpen={isOpen}
        selectedOrder={selectedOrder || undefined}
        createOrder={createOrder}
        toggleModal={toggleModal}
        openCreateOrder={openCreateOrder}
        updateOrder={updateOrder}
        finishOrder={finishOrder}
        showTrigger={false}  {/* ⚠️ IMPORTANTE: desactivar trigger interno */}
      />
    </div>
  );
};
```

### Tokens de Diseño Usados

- **Container**: `surface-card` (background + border + shadow)
- **Border**: `border-subtle` (línea divisoria sutil)
- **Padding**: `px-6 py-5` (consistente con CreateOrderForm)
- **Typography**: `text-primary`, `text-secondary` (jerarquía visual)
- **Rounded**: `rounded-xl` (esquinas suaves)
- **Shadow**: `shadow-sm` (elevación sutil)

### Validación Step 3

- [x] Header muestra título "Pedidos" y descripción
- [x] Border divisorio entre título y filtros
- [x] Grid preparado para 3 columnas (2 fechas + estados)
- [x] Usa tokens del sistema (`surface-card`, `border-subtle`, etc.)
- [x] No hay colores hardcodeados (`bg-red-200`, `text-slate-500`, etc.)

---

## Step 4: Crear Inputs de Fecha

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Agregar dos campos date picker en el grid de filtros.

### Handlers de Fecha

Agregar antes del return:

```typescript
const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFilters((prev) => ({
    ...prev,
    dateFrom: e.target.value || null,
  }));
};

const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFilters((prev) => ({
    ...prev,
    dateTo: e.target.value || null,
  }));
};
```

### HTML de Inputs de Fecha

Agregar dentro del grid (reemplazar comentario `{/* Date Inputs - Step 4 */}`):

```tsx
{/* Fecha Desde */}
<div>
  <label
    htmlFor="filter-date-from"
    className="mb-1.5 block text-sm font-medium text-primary"
  >
    Desde
  </label>
  <input
    id="filter-date-from"
    type="date"
    value={filters.dateFrom || ""}
    onChange={handleDateFromChange}
    className="input-base"
    placeholder="dd/mm/yyyy"
  />
  <p className="mt-1 text-xs text-secondary">
    Fecha estimada de entrega inicial
  </p>
</div>

{/* Fecha Hasta */}
<div>
  <label
    htmlFor="filter-date-to"
    className="mb-1.5 block text-sm font-medium text-primary"
  >
    Hasta
  </label>
  <input
    id="filter-date-to"
    type="date"
    value={filters.dateTo || ""}
    onChange={handleDateToChange}
    max={filters.dateFrom || undefined}  {/* ⚠️ Opcional: validación */}
    className="input-base"
    placeholder="dd/mm/yyyy"
  />
  <p className="mt-1 text-xs text-secondary">
    Fecha estimada de entrega final
  </p>
</div>
```

### Validación Step 4

- [x] Input "Desde" funciona y actualiza `filters.dateFrom`
- [x] Input "Hasta" funciona y actualiza `filters.dateTo`
- [x] Inputs usan clase `input-base` (estilo consistente)
- [x] Labels usan `text-sm font-medium text-primary`
- [x] Hint text usa `text-xs text-secondary`
- [x] Valores null se manejan correctamente (campo vacío)
- [x] Tabla se filtra automáticamente al cambiar fechas

---

## Step 5: Crear Selector de Estados

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Agregar selector de estados usando botones toggle con colores semánticos.

### Patrón Recomendado: Status Buttons Toggle

Este patrón usa botones individuales para cada estado que se pueden toggle on/off. Ventajas:
- Visual consistente con badges de estado en tabla
- Accesible (keyboard navigation, clear selection)
- Multi-select natural (click para toggle)
- Colores semánticos del sistema

### Labels y Colores de Estados

```typescript
const statusOptions: { value: OrderStatus; label: string; colorClass: string }[] = [
  { value: "confirmed", label: "Confirmado", colorClass: "bg-info" },
  { value: "in_progress", label: "En progreso", colorClass: "bg-warning" },
  { value: "ready", label: "Listo", colorClass: "bg-success" },
  { value: "shipped", label: "Enviado", colorClass: "bg-accent" },
  { value: "delivered", label: "Entregado", colorClass: "bg-secondary" },
  { value: "cancelled", label: "Cancelado", colorClass: "bg-danger" },
];
```

### Handler de Estados

Agregar antes del return:

```typescript
const handleStatusToggle = (status: OrderStatus) => {
  setFilters((prev) => {
    const isSelected = prev.statuses.includes(status);
    return {
      ...prev,
      statuses: isSelected
        ? prev.statuses.filter((s) => s !== status)  // Remove
        : [...prev.statuses, status],  // Add
    };
  });
};
```

### HTML de Selector de Estados

Agregar dentro del grid (reemplazar comentario `{/* Status Selector - Step 5 */}`):

```tsx
{/* Selector de Estados */}
<div className="sm:col-span-2 lg:col-span-1">
  <label className="mb-1.5 block text-sm font-medium text-primary">
    Estados
  </label>
  <div className="flex flex-wrap gap-2">
    {statusOptions.map((option) => {
      const isSelected = filters.statuses.includes(option.value);
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => handleStatusToggle(option.value)}
          className={`
            flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
            transition-all duration-150
            ${
              isSelected
                ? `${option.colorClass} text-white shadow-sm`
                : "bg-surface-elevated text-secondary border border-subtle hover:bg-surface-hover"
            }
          `}
        >
          <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
          {option.label}
        </button>
      );
    })}
  </div>
  <p className="mt-1 text-xs text-secondary">
    Selecciona uno o más estados para filtrar
  </p>
</div>
```

### Validación Step 5

- [x] Muestra 6 botones de estados (confirmed, in_progress, ready, shipped, delivered, cancelled)
- [x] Click en botón toggle on/off el estado
- [x] Estados seleccionados muestran color semántico (`bg-info`, `bg-warning`, etc.)
- [x] Estados no seleccionados muestran `bg-surface-elevated` con border
- [x] Dot indicator usa mismo color que el estado
- [x] Multi-select funciona (puedo seleccionar varios estados)
- [x] Tabla se filtra automáticamente al cambiar estados
- [x] Hover state funciona en botones no seleccionados

---

## Step 6: Migrar Botón "Nuevo Pedido"

**Archivo**: `src/pages/orders/CreateOrderForm.tsx`

**Tarea**: Desactivar el trigger button interno del formulario (ahora está en OrdersHeader).

### Modificación en CreateOrderForm

Ya incluido en Step 3: agregar prop `showTrigger={false}` al llamar CreateOrderForm desde OrdersHeader:

```tsx
<CreateOrderForm
  isOpen={isOpen}
  selectedOrder={selectedOrder || undefined}
  createOrder={createOrder}
  toggleModal={toggleModal}
  openCreateOrder={openCreateOrder}
  updateOrder={updateOrder}
  finishOrder={finishOrder}
  showTrigger={false}  {/* ⚠️ Desactiva el botón interno */}
/>
```

El botón ya está en OrdersHeader (Step 3), por lo que no necesitamos cambios adicionales.

### Validación Step 6

- [x] Botón "Nuevo pedido" aparece en header (arriba a la derecha)
- [x] Click en botón abre modal de CreateOrderForm
- [x] NO aparece botón duplicado (el interno de CreateOrderForm está oculto)
- [x] Botón usa `btn-base btn-secondary` con ícono de cruz (+)
- [x] Modal funciona correctamente (crear y editar pedidos)

---

## Verificación de Fase 2

### Tests Visuales

1. **Header completo**: Muestra título, descripción, 2 inputs de fecha, selector de estados, y botón "Nuevo pedido"
2. **Grid responsive**: En desktop muestra 3 columnas (fecha desde, fecha hasta, estados)
3. **Colores consistentes**: Usa tokens semánticos sin hardcodear colores
4. **Typography correcta**: Labels en `text-sm font-medium text-primary`, hints en `text-xs text-secondary`
5. **Spacing correcto**: Padding `px-6 py-5`, gap `gap-4` en grid

### Tests Funcionales

1. **Filtro por fecha desde**: Cambiar fecha desde → tabla muestra solo pedidos >= fecha
2. **Filtro por fecha hasta**: Cambiar fecha hasta → tabla muestra solo pedidos <= fecha
3. **Filtro por rango de fechas**: Desde + Hasta → tabla muestra pedidos en rango
4. **Filtro por un estado**: Click en "Confirmado" → tabla muestra solo pedidos confirmados
5. **Filtro por múltiples estados**: Click en "Confirmado" + "En progreso" → tabla muestra ambos
6. **Deseleccionar estado**: Click en estado seleccionado → se quita del filtro
7. **Todos los estados deseleccionados**: Array vacío → tabla muestra todos los pedidos
8. **Botón crear orden**: Click en "Nuevo pedido" → abre modal CreateOrderForm
9. **Modal funcional**: Crear y editar pedidos sigue funcionando correctamente

### Tests de Accesibilidad

1. **Labels correctos**: Todos los inputs tienen `<label>` con `htmlFor`
2. **Focus visible**: Inputs y botones muestran focus ring al navegar con teclado
3. **Keyboard navigation**: Tab recorre todos los controles en orden lógico
4. **Color contrast**: Textos cumplen WCAG AA (primary/secondary tienen buen contraste)

---

## Archivos Modificados

- ✅ `src/pages/orders/OrdersHeader.tsx` — Rediseño completo del header
- ✅ `src/pages/orders/CreateOrderForm.tsx` — Prop `showTrigger={false}` en llamada

---

## Siguiente Fase

**Fase 3**: Refinamiento - indicador de filtros activos, botón limpiar filtros, y responsive design.

---

## Notas de Diseño

### ¿Por qué botones toggle en lugar de dropdown?

- **Visual**: Consistencia con badges de estado en tabla
- **UX**: Multi-select más intuitivo (no requiere Ctrl+Click)
- **Accesible**: Mejor keyboard navigation y screen reader support
- **Espacio**: Suficiente espacio horizontal en desktop

### ¿Por qué grid de 3 columnas?

- **Desktop**: Fecha desde (1fr) + Fecha hasta (1fr) + Estados (2fr) = bien balanceado
- **Tablet**: 2 columnas (fechas arriba, estados abajo span 2 cols)
- **Mobile**: 1 columna (stack vertical)

### ¿Por qué `input-base` en lugar de componente custom?

- **Simplicidad**: HTML nativo `<input type="date">` funciona bien
- **Consistencia**: Mismo estilo que otros inputs del sistema
- **Accesibilidad**: Date picker nativo del browser es accesible
- **Progressive enhancement**: Fallback a text input en browsers antiguos
