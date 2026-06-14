# Arquitectura - Ebzer Web

## Patrón Arquitectónico: Feature-based Architecture

Estructura modular organizada por features con separación de concerns entre presentación, lógica y datos.

## Flujo de Dependencias

```
main.tsx (Entry Point)
  └─→ App.tsx (Router)
        └─→ DashboardLayout (Shell)
              ├─→ OrdersPage
              ├─→ IncomesPage
              └─→ ExpensesPage
                    ├─→ Components
                    ├─→ Hooks (State Logic)
                    └─→ Services (API Calls)
```

## Estructura por Capas

### 1. Entry Point (`src/main.tsx`)
**Responsabilidad**: Bootstrapping de la aplicación
- Renderiza el árbol de React
- Mount point en el DOM
- Importa estilos globales

**Relaciones**: main → App

---

### 2. Router Configuration (`src/App.tsx`)
**Responsabilidad**: Definición de rutas y navegación
- Configura `react-router-dom`
- Define estructura de rutas anidadas
- Layout compartido para todas las páginas

**Routing Tree**:
```
/ (DashboardLayout)
├─ index → OrdersPage
├─ incomes → IncomesPage
└─ expenses → ExpensesPage
```

**Relaciones**: App → Layouts → Pages

---

### 3. Layouts (`src/layouts/`)
**Responsabilidad**: Shells reutilizables de UI

#### `DashboardLayout`
- Wrapper común para todas las páginas
- Probablemente contiene: Navbar, Sidebar, Footer
- Usa `<Outlet />` para renderizar páginas hijas

**Relaciones**: Layout → Navbar → `<Outlet>` (Pages)

---

### 4. Pages (`src/pages/`)
**Responsabilidad**: Vistas de alto nivel por feature

Organización por dominio:
```
pages/
├─ orders/
│  ├─ OrdersPage.tsx       → Composición principal
│  ├─ OrdersHeader.tsx     → Controles y filtros
│  ├─ OrdersTable.tsx      → Listado de órdenes
│  ├─ CreateOrderForm.tsx  → Formulario de creación
│  ├─ types.ts             → Tipos específicos
│  └─ index.ts             → Barrel export
├─ incomes/
│  └─ IncomesPage.tsx
└─ expenses/
   └─ ExpensesPage.tsx
```

**Patrón de Composición (Orders como ejemplo)**:
```
OrdersPage
  ├─→ OrdersHeader (Botones, filtros)
  ├─→ OrdersTable (Lista)
  └─→ CreateOrderForm (Modal/Form)
```

**Relaciones**: Pages → Components + Hooks + Services

---

### 5. Components (`src/components/`)
**Responsabilidad**: Componentes reutilizables transversales

Componentes compartidos entre features:
- `Navbar` - Navegación principal
- `ConfirmModal` - Modal de confirmación genérico
- `index.ts` - Barrel para exports limpios

**Relaciones**: Components → Hooks (opcional)

---

### 6. Hooks (`src/hooks/`)
**Responsabilidad**: Lógica de estado reutilizable

Custom hooks identificados:
- `useConfirmModal` - Estado y lógica de modales de confirmación
- `useOrders` - Estado y operaciones de órdenes (probablemente consume `orders.service`)
- `index.ts` - Exports centralizados

**Patrón**:
```typescript
// Ejemplo conceptual de useOrders
function useOrders() {
  // Estado local
  // Llamadas a services
  // Transformaciones de datos
  // Return de estado + acciones
}
```

**Relaciones**: Hooks → Services

---

### 7. Services (`src/services/`)
**Responsabilidad**: Comunicación con APIs externas

#### `api.ts` - HTTP Client base
```typescript
{
  get(endpoint)
  post(endpoint, data)
  put(endpoint, data)
  delete(endpoint)
}
```

Configuración:
- Base URL desde `VITE_API_BASE_URL` env var
- Fallback: `http://localhost:3000/api`

#### `orders.service.ts` - API de Orders
Abstrae llamadas específicas al backend de órdenes

**Relaciones**: Services → Backend API (HTTP)

---

### 8. Utils (`src/utils/`)
**Responsabilidad**: Utilidades y helpers puros

- `order.ts` - Helpers relacionados a órdenes (formateo, cálculos, etc.)
- Funciones sin side-effects

**Relaciones**: Utils → (No depende de nada, es consumido por todo)

---

## Flujo de Datos Típico

### Ejemplo: Crear una Orden

```
[User clicks "Create Order"]
         ↓
[CreateOrderForm] - Componente captura input
         ↓
[useOrders hook] - Custom hook con lógica de estado
         ↓
[orders.service.ts] - Abstracción de API
         ↓
[api.ts] - HTTP client
         ↓
[Backend API] - POST /api/orders
         ↓
[Response] - {id: 123}
         ↓
[useOrders] - Actualiza estado local
         ↓
[OrdersTable] - Re-renderiza con nueva orden
```

## Principios Aplicados

✅ **Feature-based Organization** - Código agrupado por dominio (orders, incomes, expenses)
✅ **Component Composition** - Componentes pequeños y componibles
✅ **Separation of Concerns** - Presentación (Components) ≠ Lógica (Hooks) ≠ Datos (Services)
✅ **Barrel Exports** - Uso de `index.ts` para imports limpios
✅ **Custom Hooks** - Extracción de lógica reutilizable

## Puntos de Mejora Identificados

⚠️ **Sin gestión de estado global** - Múltiples features podrían necesitar compartir datos (ej: user session)
⚠️ **API service sin manejo de errores** - No valida `response.ok`, ni maneja errores HTTP
⚠️ **Sin loading/error states estandarizados** - Cada componente probablemente duplica esta lógica
⚠️ **Fetch directo sin cache** - No hay invalidación ni revalidación automática (considera React Query)
⚠️ **Types locales por página** - Podrían estar duplicados con el backend (considera code generation)
⚠️ **Sin validación de formularios** - Lógica de validación probablemente manual y repetitiva
⚠️ **Sin lazy loading de rutas** - Todas las páginas se cargan en el bundle inicial
⚠️ **Navbar en components pero solo usada en Layout** - Podría estar en `/layouts/components/`

## Diagrama de Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Pages + Components + Layouts)         │
│                                         │
│  - OrdersPage, IncomesPage              │
│  - CreateOrderForm, OrdersTable         │
│  - DashboardLayout, Navbar              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│         State Logic Layer               │
│            (Hooks)                      │
│                                         │
│  - useOrders, useConfirmModal           │
│  - Custom reusable logic                │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│         Data Layer                      │
│          (Services)                     │
│                                         │
│  - api.ts (HTTP client)                 │
│  - orders.service.ts (Domain API)       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│         External API                    │
│      (Ebzer Backend)                    │
└─────────────────────────────────────────┘

           Utilities (Pure Functions)
          - order.ts helpers
```

## Convenciones de Proyecto

**Imports**: Usando barrel exports con `index.ts`
```typescript
// ✅ Recomendado
import { OrdersPage } from './pages';

// ❌ Evitar
import { OrdersPage } from './pages/orders/OrdersPage';
```

**Naming**:
- Componentes: PascalCase (`OrdersPage.tsx`)
- Hooks: camelCase con prefijo `use` (`useOrders.ts`)
- Services: camelCase con sufijo `.service` (`orders.service.ts`)
- Utils: camelCase (`order.ts`)
