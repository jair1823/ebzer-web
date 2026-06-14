# Stack Tecnológico - Ebzer Web

## Librería Principal
- **React 19.2.0** - Librería UI con Server Components y nuevas APIs
  - Versión más reciente con mejoras de rendimiento
  - Nuevos hooks y patterns

## Framework de Build
- **Vite 7.2.4** - Build tool de última generación
  - Hot Module Replacement (HMR) ultra rápido
  - Build optimizado con Rollup
  - ESM nativo en desarrollo

## Lenguaje
- **TypeScript 5.9.3** - JavaScript con tipado estático
  - Configuración strict para mayor type-safety
  - TSConfig separado para app y node

## Routing
- **React Router** (implícito en código) - Navegación declarativa
  - Nested routes con `DashboardLayout`
  - Rutas: `/` (orders), `/incomes`, `/expenses`

## Estilos
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
  - `@tailwindcss/vite` - Plugin oficial para integración con Vite
  - Configuración moderna (v4)
  - Tokens semánticos de color definidos en `src/index.css`

## Calidad de Código
- **ESLint 9.39.1** - Linter JavaScript/TypeScript
  - Plugin React Hooks - Valida reglas de hooks
  - Plugin React Refresh - Compatibilidad con Fast Refresh
  - TypeScript ESLint 8.46.4

## Herramientas de Desarrollo
- **@vitejs/plugin-react 5.1.1** - Fast Refresh para React
- **@types/react & @types/react-dom** - Definiciones de tipos para TypeScript

## HTTP Client
- **Fetch API nativa** - Sin librerías externas (axios, etc.)
  - Implementación custom en `services/api.ts`
  - Manejo manual de headers y métodos

## Gestión de Estado
- **React Hooks nativos** (basado en estructura)
  - Custom hooks: `useConfirmModal`, `useOrders`
  - No se usa Redux, Zustand, ni otras librerías de estado global

## Estructura de Tipos
- **TypeScript types locales** - Definidos por módulo
  - Ejemplo: `pages/orders/types.ts`

## Notas de Mejora
⚠️ **Sin librería de fetching moderna** - Considera React Query o SWR para cache y sincronización
⚠️ **No hay manejo de errores HTTP centralizado** - `api.ts` no valida status codes
⚠️ **Sin validación de formularios** - Considera react-hook-form + zod
⚠️ **No hay testing configurado** - Falta Jest/Vitest + Testing Library
⚠️ **Sin UI component library** - Todo custom, considera shadcn/ui o similar para consistencia
