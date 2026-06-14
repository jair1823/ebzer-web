# Fase 3: Refinamiento del Sistema de Filtros

**Objetivo**: Agregar indicador de filtros activos, botón limpiar filtros, y responsive design.

**Prerequisitos**: Fase 1 y Fase 2 completadas (tipos, estado, y UI básica del header).

**Contexto**: Actualmente el header tiene filtros funcionales pero falta feedback visual de filtros activos, forma de resetearlos fácilmente, y optimización para mobile/tablet.

---

## Alcance de esta Fase

Esta fase agrega:
- Badge indicador de filtros activos
- Botón "Limpiar filtros"
- Responsive design (mobile/tablet/desktop)
- Mejoras de UX y accesibilidad

---

## Step 7: Crear Función Auxiliar de Filtros Activos

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Detectar cuántos filtros están activos para mostrar indicador y botón limpiar.

### Helper Function

Agregar antes del return:

```typescript
const getActiveFiltersCount = (): number => {
  let count = 0;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.statuses.length > 0) count += filters.statuses.length;
  return count;
};

const hasActiveFilters = (): boolean => {
  return filters.dateFrom !== null || 
         filters.dateTo !== null || 
         filters.statuses.length > 0;
};
```

### Validación Step 7

- [x] `getActiveFiltersCount()` retorna número correcto:
  - Sin filtros → 0
  - Solo fecha desde → 1
  - Fecha desde + hasta → 2
  - 2 estados seleccionados → 2
  - Fecha desde + 2 estados → 3
- [x] `hasActiveFilters()` retorna boolean correcto

---

## Step 8: Agregar Indicador de Filtros Activos

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Mostrar badge junto al título "Pedidos" cuando hay filtros activos.

### Modificación del Título

Cambiar:

```tsx
<h1 className="text-2xl font-semibold tracking-tight text-primary">
  Pedidos
</h1>
```

Por:

```tsx
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-semibold tracking-tight text-primary">
    Pedidos
  </h1>
  {hasActiveFilters() && (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-on-accent">
      {getActiveFiltersCount()} {getActiveFiltersCount() === 1 ? "filtro" : "filtros"}
    </span>
  )}
</div>
```

### Tokens Usados

- **Badge background**: `bg-accent-soft` (color suave de énfasis)
- **Badge text**: `text-on-accent` (contraste con background)
- **Shape**: `rounded-full` (pill shape)
- **Spacing**: `px-2.5 py-0.5` (compact)
- **Typography**: `text-xs font-medium` (pequeño pero legible)

### Validación Step 8

- [x] Badge NO aparece sin filtros activos
- [x] Badge aparece al activar cualquier filtro
- [x] Badge muestra número correcto de filtros
- [x] Badge usa singular/plural correctamente ("1 filtro" vs "2 filtros")
- [x] Badge usa tokens del sistema (`bg-accent-soft`, `text-on-accent`)
- [x] Badge se alinea correctamente con el título

---

## Step 9: Agregar Botón "Limpiar Filtros"

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Agregar botón para resetear todos los filtros.

### Handler de Limpiar

Agregar antes del return:

```typescript
const handleClearFilters = () => {
  setFilters({
    dateFrom: null,
    dateTo: null,
    statuses: [],
  });
};
```

### Botón en la UI

Agregar **después** del botón "Nuevo pedido" (dentro del mismo div de acciones):

```tsx
<div className="flex items-center gap-3">
  {/* Botón Limpiar - solo visible con filtros activos */}
  {hasActiveFilters() && (
    <button
      type="button"
      className="btn-base btn-outline rounded-md"
      onClick={handleClearFilters}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      Limpiar filtros
    </button>
  )}

  {/* Botón Nuevo Pedido */}
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
```

### Validación Step 9

- [x] Botón NO aparece sin filtros activos
- [x] Botón aparece al activar cualquier filtro
- [x] Click en botón resetea todos los filtros (fechas y estados)
- [x] Tabla muestra todos los pedidos después de limpiar
- [x] Badge de filtros activos desaparece al limpiar
- [x] Botón usa `btn-base btn-outline` (estilo secundario)
- [x] Ícono de X se ve correctamente
- [x] Botón tiene spacing correcto con "Nuevo pedido"

---

## Step 10: Responsive Design

**Archivo**: `src/pages/orders/OrdersHeader.tsx`

**Tarea**: Optimizar layout para mobile, tablet, y desktop.

### Estrategia Responsive

**Mobile (< 640px)**:
- Stack vertical completo
- Botones en columna
- Fecha desde/hasta en columna
- Estados wrap naturally

**Tablet (640px - 1024px)**:
- Título + botones en fila
- Fechas en 2 columnas
- Estados span completo debajo

**Desktop (> 1024px)**:
- Grid de 3 columnas como está
- Todo en una sola fila de filtros

### Modificaciones Responsive

#### Title Section

Cambiar:
```tsx
<div className="flex items-start justify-between gap-6">
```

Por:
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
```

#### Botones de Acción

Cambiar:
```tsx
<div className="flex items-center gap-3">
```

Por:
```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
```

#### Grid de Filtros

Ya responsive con:
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
```

Esto da:
- **Mobile**: 1 columna (stack)
- **Tablet**: 2 columnas (fechas lado a lado, estados abajo)
- **Desktop**: 3 columnas (todo en fila)

#### Estados en Mobile

Para que los botones de estados wrappeen bien, ya están con:
```tsx
<div className="flex flex-wrap gap-2">
```

### Padding Responsive

Cambiar padding del container principal:

```tsx
<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
```

### Validación Step 10

#### Mobile (< 640px)
- [x] Título y botones en columna
- [x] Botón "Limpiar" arriba de "Nuevo pedido"
- [x] Fechas en columna
- [x] Estados wrap en múltiples filas
- [x] Padding reducido (`px-4 py-4`)
- [x] Touch targets de 44px mínimo

#### Tablet (640px - 1024px)
- [x] Título y botones en fila
- [x] Fechas en 2 columnas
- [x] Estados en fila completa debajo
- [x] Padding medio (`px-6 py-6`)

#### Desktop (> 1024px)
- [x] Todo el layout en una sola vista
- [x] Grid de 3 columnas balanceado
- [x] Botones alineados a la derecha
- [x] Padding completo (`px-8 py-8`)

---

## Mejoras de UX Adicionales

### Accesibilidad

Agregar `aria-label` a botones:

```tsx
<button
  type="button"
  className="btn-base btn-outline rounded-md"
  onClick={handleClearFilters}
  aria-label="Limpiar todos los filtros activos"
>
```

```tsx
<button
  type="button"
  className="btn-base btn-secondary focus-ring rounded-md shadow-md"
  onClick={openCreateOrder}
  aria-label="Crear nuevo pedido"
>
```

### Focus Management

Asegurar que inputs de fecha tengan focus visible:

```tsx
<input
  id="filter-date-from"
  type="date"
  value={filters.dateFrom || ""}
  onChange={handleDateFromChange}
  className="input-base focus-ring"  {/* ⚠️ Agregar focus-ring */}
  placeholder="dd/mm/yyyy"
  aria-label="Filtrar pedidos desde esta fecha"
/>
```

### Empty State Message

Agregar mensaje cuando no hay pedidos después de filtrar (en OrdersTable):

```tsx
{loading ? (
  "Cargando pedidos..."
) : orders.length === 0 ? (
  "No se encontraron pedidos con los filtros aplicados. Intenta ajustar los criterios o limpiar los filtros."
) : (
  "No hay pedidos disponibles."
)}
```

---

## Verificación de Fase 3

### Tests Visuales

1. **Badge de filtros**: Aparece/desaparece correctamente, muestra cuenta correcta
2. **Botón limpiar**: Aparece/desaparece con filtros, estilo correcto
3. **Responsive mobile**: Layout stack vertical funciona bien
4. **Responsive tablet**: Layout 2 columnas + fila estados funciona bien
5. **Responsive desktop**: Layout 3 columnas balanceado

### Tests Funcionales

1. **Indicador de filtros activos**: Cuenta correcta (1 filtro, 2 filtros, etc.)
2. **Limpiar filtros**: Resetea todos los filtros a valores iniciales
3. **Tabla actualiza**: Muestra todos los pedidos después de limpiar
4. **Badge desaparece**: Al limpiar filtros, badge desaparece
5. **Botón desaparece**: Al limpiar filtros, botón "Limpiar" desaparece
6. **Empty state**: Mensaje correcto cuando filtros no coinciden con ningún pedido

### Tests de Accesibilidad

1. **Aria labels**: Botones tienen `aria-label` descriptivos
2. **Focus ring**: Todos los inputs/botones muestran focus visible
3. **Keyboard navigation**: Tab recorre controles en orden lógico
4. **Screen reader**: Anuncia correctamente filtros activos y acciones

### Tests Responsive

1. **Mobile (375px)**: Todo apilado, botones accesibles, texto legible
2. **Tablet (768px)**: Fechas lado a lado, estados debajo, botones en fila
3. **Desktop (1440px)**: Todo en vista, grid balanceado, spacing correcto
4. **Touch targets**: Mínimo 44px en mobile para botones y estados

---

## Archivos Modificados

- ✅ `src/pages/orders/OrdersHeader.tsx` — Badge, botón limpiar, responsive
- ✅ `src/pages/orders/OrdersTable.tsx` — Mensaje empty state mejorado

---

## Fin del Plan de Filtros

Con esta fase completada, el sistema de filtros está completo y production-ready:
- ✅ Fase 1: Estructura y estado (tipos, lógica de filtrado)
- ✅ Fase 2: UI del header (inputs fecha, selector estados, botón crear)
- ✅ Fase 3: Refinamiento (indicador, limpiar, responsive)

---

## Consideraciones Futuras

### Performance

Si la lista de pedidos crece (>1000 items):
- Implementar virtualización de tabla (react-window o similar)
- Mover filtrado a backend con query params
- Agregar paginación

### Features Adicionales

**Persistencia de filtros**:
```typescript
// Guardar en localStorage
useEffect(() => {
  localStorage.setItem('ordersFilters', JSON.stringify(filters));
}, [filters]);

// Cargar de localStorage
const [filters, setFilters] = useState<OrderFilters>(() => {
  const saved = localStorage.getItem('ordersFilters');
  return saved ? JSON.parse(saved) : { dateFrom: null, dateTo: null, statuses: [] };
});
```

**Filtro por cliente**:
```typescript
interface OrderFilters {
  dateFrom: string | null;
  dateTo: string | null;
  statuses: OrderStatus[];
  clientSearch: string;  // New field
}
```

**Ordenamiento de columnas**:
- Click en header → ordenar ascendente/descendente
- Indicador visual de columna activa
- Multi-column sort con shift+click

**Filtros avanzados (modal)**:
- Rango de precios (amount_charged)
- Tipo de entrega (delivery_type)
- Pedidos con/sin teléfono
- Pedidos con notas

**Export/Share**:
- Exportar pedidos filtrados a CSV/Excel
- Generar URL con filtros para compartir
- Imprimir reporte de pedidos filtrados
