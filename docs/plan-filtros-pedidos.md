# Plan de Implementación: Sistema de Filtros para Pedidos

**Estado**: 🟡 Pendiente de implementación  
**Fecha de creación**: 19 de abril de 2026  
**Tipo de trabajo**: Feature nueva  

---

## Resumen Ejecutivo

Rediseñar completamente `OrdersHeader` para convertirlo en un header funcional de tabla con:
- Título de sección "Pedidos"
- Filtros de fecha (rango desde/hasta)
- Filtro multi-estado (confirmed, in_progress, ready, shipped, delivered, cancelled)
- Botón de acción "Nuevo pedido"
- Indicador de filtros activos
- Botón "Limpiar filtros"
- Diseño responsive (mobile/tablet/desktop)

**Actualmente**: OrdersHeader solo tiene un comentario `{/* todo filters */}` y el botón de crear orden está dentro de CreateOrderForm.

**Resultado esperado**: Header completo, funcional, y estéticamente consistente con el sistema de diseño del proyecto (tokens semánticos, sin colores hardcodeados, accesible, responsive).

---

## Estructura del Plan

Este plan está dividido en **3 fases** independientes que deben ejecutarse en orden:

### 📋 [Fase 1: Estructura y Estado](./fase-1-filtros-estructura-estado.md)

**Objetivo**: Preparar infraestructura de tipos y estado.

**Alcance**:
- ✅ Definir interface `OrderFilters` en `types.ts`
- ✅ Agregar estado de filtros en `OrdersPage.tsx`
- ✅ Implementar función `applyFilters()` client-side
- ✅ Actualizar props de `OrdersHeader.tsx`

**Archivos modificados**:
- `src/pages/orders/types.ts`
- `src/pages/orders/OrdersPage.tsx`
- `src/pages/orders/OrdersHeader.tsx`

**Verificación**:
- No hay errores TypeScript
- App compila y funciona
- Estado `filters` existe con valores iniciales
- Función `applyFilters()` filtra correctamente
- Props pasadas a OrdersHeader

**Duración estimada**: 30-45 minutos

---

### 🎨 [Fase 2: UI del Header](./fase-2-filtros-ui-header.md)

**Objetivo**: Construir interfaz completa del header con filtros.

**Alcance**:
- ✅ Rediseñar estructura completa de OrdersHeader
- ✅ Agregar inputs de fecha (desde/hasta)
- ✅ Crear selector de estados (botones toggle)
- ✅ Migrar botón "Nuevo pedido" desde CreateOrderForm

**Archivos modificados**:
- `src/pages/orders/OrdersHeader.tsx` (rediseño completo)
- `src/pages/orders/CreateOrderForm.tsx` (prop `showTrigger={false}`)

**Verificación**:
- Header muestra título, 2 inputs fecha, selector estados, botón crear
- Filtrar por fechas funciona correctamente
- Filtrar por estados funciona correctamente
- Multi-select de estados funciona
- Botón "Nuevo pedido" abre modal
- Usa tokens del sistema de diseño

**Duración estimada**: 1-2 horas

---

### ✨ [Fase 3: Refinamiento](./fase-3-filtros-refinamiento.md)

**Objetivo**: Agregar indicadores, botón limpiar, y responsive design.

**Alcance**:
- ✅ Badge indicador de filtros activos
- ✅ Botón "Limpiar filtros"
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Mejoras de accesibilidad
- ✅ Empty state message

**Archivos modificados**:
- `src/pages/orders/OrdersHeader.tsx`
- `src/pages/orders/OrdersTable.tsx` (empty state)

**Verificación**:
- Badge aparece/desaparece con filtros activos
- Botón limpiar resetea todos los filtros
- Layout responsive funciona en todos los tamaños
- Accesibilidad (aria-labels, focus ring, keyboard nav)
- Empty state correcto cuando no hay resultados

**Duración estimada**: 1 hora

---

## Agentes Recomendados

### Agente 1: Fase 1 - Backend/State
**Perfil**: Especialista en TypeScript, state management, lógica de filtrado  
**Archivo**: [fase-1-filtros-estructura-estado.md](./fase-1-filtros-estructura-estado.md)  
**Responsabilidad**: Preparar tipos, estado, y lógica de filtrado  

### Agente 2: Fase 2 - UI/Frontend
**Perfil**: Especialista en React, UI components, design systems  
**Archivo**: [fase-2-filtros-ui-header.md](./fase-2-filtros-ui-header.md)  
**Responsabilidad**: Construir interfaz del header con filtros  

### Agente 3: Fase 3 - UX/Polish
**Perfil**: Especialista en UX, responsive design, accesibilidad  
**Archivo**: [fase-3-filtros-refinamiento.md](./fase-3-filtros-refinamiento.md)  
**Responsabilidad**: Refinar UX, responsive, y accesibilidad  

---

## Dependencias entre Fases

```
Fase 1 (Estructura y Estado)
    ↓
Fase 2 (UI del Header)
    ↓
Fase 3 (Refinamiento)
```

**⚠️ IMPORTANTE**: Cada fase debe completarse y verificarse antes de pasar a la siguiente.

---

## Archivos del Proyecto Relevantes

### Archivos a Modificar
- `src/pages/orders/types.ts` — Agregar interface `OrderFilters`
- `src/pages/orders/OrdersPage.tsx` — Estado y lógica de filtrado
- `src/pages/orders/OrdersHeader.tsx` — Rediseño completo del header
- `src/pages/orders/CreateOrderForm.tsx` — Prop `showTrigger={false}`
- `src/pages/orders/OrdersTable.tsx` — Empty state message

### Archivos de Referencia
- `src/index.css` — Tokens del sistema (`input-base`, `btn-*`, colores)
- `docs/design-tokens.md` — Guía de colores y convenciones
- `docs/arquitectura.md` — Estructura del proyecto
- `/memories/repo/navbar-design-patterns.md` — Patrones de diseño aplicados

---

## Decisiones de Diseño

### Client-side vs Server-side Filtering
**Decisión**: Client-side filtering  
**Razones**:
- Dataset pequeño (< 1000 pedidos típicamente)
- No requiere cambios en API
- Filtrado instantáneo sin network latency
- Fácil migrar a server-side cuando crezca

### Fecha de Referencia
**Decisión**: Usar `estimated_delivery_date`  
**Razones**:
- Más relevante para usuarios que `entry_date`
- Representa cuándo esperan recibir el pedido
- Natural para filtros de "próximos pedidos"

### Selector de Estados
**Decisión**: Botones toggle (no dropdown)  
**Razones**:
- Visual consistente con badges en tabla
- Multi-select más intuitivo
- Mejor accesibilidad (keyboard nav, screen reader)
- Suficiente espacio horizontal en desktop

### Array Vacío = Mostrar Todos
**Decisión**: `statuses: []` muestra todos los pedidos  
**Razones**:
- Mejor UX (no ocultar por defecto)
- Explícito (usuario debe seleccionar para filtrar)
- Consistente con fechas (null = sin filtro)

### No Persistir en localStorage
**Decisión**: No guardar filtros entre sesiones  
**Razones**:
- Comenzar simple (YAGNI)
- Usuarios pueden reabrir filtros fácilmente
- Evitar confusión ("¿por qué no veo todos mis pedidos?")
- Fácil agregar después si usuarios lo solicitan

---

## Verificación Final

### Checklist Completo

#### Funcionalidad
- [ ] Filtrar por fecha desde funciona
- [ ] Filtrar por fecha hasta funciona
- [ ] Filtrar por rango de fechas funciona
- [ ] Filtrar por un estado funciona
- [ ] Filtrar por múltiples estados funciona
- [ ] Deseleccionar estados funciona
- [ ] Sin filtros muestra todos los pedidos
- [ ] Limpiar filtros resetea todo
- [ ] Botón "Nuevo pedido" abre modal
- [ ] Crear/editar pedidos sigue funcionando

#### UI/UX
- [ ] Header muestra título y descripción
- [ ] Inputs de fecha tienen labels y hints
- [ ] Selector de estados usa colores semánticos
- [ ] Badge de filtros activos muestra cuenta correcta
- [ ] Botón limpiar aparece/desaparece correctamente
- [ ] Empty state message cuando no hay resultados
- [ ] Sin colores hardcodeados (solo tokens)

#### Responsive
- [ ] Mobile: layout stack vertical
- [ ] Tablet: fechas en 2 cols, estados debajo
- [ ] Desktop: grid 3 columnas balanceado
- [ ] Touch targets mínimo 44px en mobile
- [ ] Padding responsive correcto

#### Accesibilidad
- [ ] Labels con `htmlFor` correctos
- [ ] Aria-labels en botones
- [ ] Focus ring visible en todos los controles
- [ ] Keyboard navigation funciona
- [ ] Color contrast cumple WCAG AA

#### Code Quality
- [ ] No hay errores TypeScript
- [ ] No hay warnings de ESLint
- [ ] Código bien formateado
- [ ] Nombres de variables descriptivos
- [ ] Comentarios donde necesario

---

## Consideraciones Futuras

Mejoras que pueden agregarse después:

1. **Persistencia de filtros** (localStorage) — Si usuarios lo solicitan
2. **Filtro por cliente** (búsqueda por nombre/teléfono) — Para muchos pedidos
3. **Ordenamiento de columnas** (click en headers) — Feature separada
4. **Filtros avanzados** (modal con más opciones) — Rango de precios, tipo entrega
5. **Export/Share** (CSV, URL con filtros) — Para reportes
6. **Server-side filtering** — Cuando dataset crezca >1000 items
7. **Virtualización de tabla** — Para performance con muchos items

---

## Testing Manual

### Test Cases

#### TC-01: Filtro por Fecha Desde
1. Abrir página de pedidos
2. Seleccionar fecha en "Desde"
3. **Esperado**: Tabla muestra solo pedidos con `estimated_delivery_date >= fecha`

#### TC-02: Filtro por Fecha Hasta
1. Abrir página de pedidos
2. Seleccionar fecha en "Hasta"
3. **Esperado**: Tabla muestra solo pedidos con `estimated_delivery_date <= fecha`

#### TC-03: Filtro por Rango de Fechas
1. Seleccionar fecha "Desde"
2. Seleccionar fecha "Hasta"
3. **Esperado**: Tabla muestra pedidos en rango

#### TC-04: Filtro por Estado Único
1. Click en botón "Confirmado"
2. **Esperado**: Tabla muestra solo pedidos con status "confirmed"
3. **Esperado**: Botón "Confirmado" tiene color `bg-info`

#### TC-05: Filtro por Múltiples Estados
1. Click en "Confirmado"
2. Click en "En progreso"
3. **Esperado**: Tabla muestra pedidos confirmados + en progreso
4. **Esperado**: Ambos botones tienen colores activos

#### TC-06: Deseleccionar Estado
1. Seleccionar "Confirmado"
2. Click de nuevo en "Confirmado"
3. **Esperado**: Estado se deselecciona, botón vuelve a `bg-surface-elevated`

#### TC-07: Limpiar Filtros
1. Aplicar varios filtros (fechas + estados)
2. Click en "Limpiar filtros"
3. **Esperado**: Todos los filtros resetean, tabla muestra todos los pedidos

#### TC-08: Badge de Filtros Activos
1. Sin filtros → **Badge no visible**
2. Agregar 1 filtro → **Badge muestra "1 filtro"**
3. Agregar 2 filtros → **Badge muestra "2 filtros"**
4. Limpiar → **Badge desaparece**

#### TC-09: Responsive Mobile
1. Redimensionar a 375px de ancho
2. **Esperado**: Título, botones, fechas, estados en stack vertical
3. **Esperado**: Touch targets mínimo 44px

#### TC-10: Accesibilidad Keyboard
1. Tab desde inicio de página
2. **Esperado**: Focus recorre: fecha desde → fecha hasta → estados → botones
3. **Esperado**: Focus ring visible en todos

---

## Contacto y Soporte

Para preguntas o problemas durante la implementación:
- Revisar archivos de fase correspondiente
- Verificar tokens en `src/index.css` y `docs/design-tokens.md`
- Consultar patrones en `/memories/repo/navbar-design-patterns.md`

---

**Última actualización**: 19 de abril de 2026  
**Versión del plan**: 1.0
