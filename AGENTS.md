# Agentes de Ebzer-Web

Este proyecto cuenta con agentes especializados para diferentes tareas de desarrollo y revisión.

## Agentes Disponibles

### 🔍 ebzer-web
**Tipo**: Review/Audit  
**Archivo**: `.github/agents/ebzer-web.agent.md`  
**Descripción**: Agente de auditoría frontend especializado en arquitectura React/TypeScript, alineación UI-dominio, mantenibilidad y seguridad frontend.

**Cuándo usar**:
- Auditar código React/TypeScript
- Revisar alineación UI con reglas de dominio
- Evaluar mantenibilidad del código
- Evaluar seguridad frontend

**Cuándo NO usar**:
- Para implementar código (es solo review)
- Para hacer refactors directos

---

### ⚙️ ebzer-filtros
**Tipo**: Implementation  
**Archivo**: `.github/agents/ebzer-filtros.agent.md`  
**Descripción**: Agente de implementación especializado en construir el sistema de filtros para pedidos en 3 fases estructuradas.

**Cuándo usar**:
- Implementar el sistema de filtros de pedidos
- Seguir el plan documentado en `docs/plan-filtros-pedidos.md`
- Ejecutar fases 1, 2, y 3 secuencialmente

**Plan de trabajo**:
1. **Fase 1**: Estructura y Estado (tipos, estado, lógica filtrado)
2. **Fase 2**: UI del Header (inputs fecha, selector estados, botón crear)
3. **Fase 3**: Refinamiento (indicadores, limpiar filtros, responsive)

**Documentación**:
- [Plan principal](../docs/plan-filtros-pedidos.md)
- [Fase 1: Estructura y Estado](../docs/fase-1-filtros-estructura-estado.md)
- [Fase 2: UI del Header](../docs/fase-2-filtros-ui-header.md)
- [Fase 3: Refinamiento](../docs/fase-3-filtros-refinamiento.md)

**Cuándo NO usar**:
- Para tareas no relacionadas con filtros
- Para revisión de código (usar ebzer-web)

---

### 📊 ebzer-orders-ux
**Tipo**: Implementation (Flexible)  
**Archivo**: `.github/agents/ebzer-orders-ux.agent.md`  
**Descripción**: Agente de implementación flexible para mejoras UX en la sección de Orders. Ejecuta un plan de 8 pasos para agregar filtrado inteligente por defecto, dashboard con métricas, y quick filters.

**Cuándo usar**:
- Implementar filtrado por defecto (últimos 30 días)
- Crear dashboard con métricas visuales
- Agregar quick filters (Todos, Activos, Pendiente Pago, etc.)
- Seguir el plan documentado en `PLAN-MEJORAS-ORDERS.md`

**Plan de trabajo**:
1. **Step 1**: Crear helpers de fecha (últimos 30/7 días, formateo)
2. **Step 2**: Actualizar ordersService para aceptar filtros
3. **Step 3**: Modificar useOrders hook (filtrado por defecto)
4. **Step 4**: Agregar tipo QuickFilterType
5. **Step 5**: Crear componente OrdersMetrics (4 cards de métricas)
6. **Step 6**: Crear componente QuickFilters (chips de filtros)
7. **Step 7**: Integrar métricas + filtros en OrdersPage
8. **Step 8**: Actualizar OrdersHeader (opcional)

**Documentación**:
- [Plan principal](../PLAN-MEJORAS-ORDERS.md)
- [Propuestas originales](../docs/propuestas-orders-mejoras.md)

**Características especiales**:
- **Flujo colaborativo**: Menciona → Confirma → Ejecuta
- **Flexible**: Acepta modificaciones y sugerencias del usuario
- **Paso a paso**: Pide confirmación antes de cada step
- **Adaptable**: Permite saltar o modificar pasos si el usuario lo solicita

**Cuándo NO usar**:
- Para revisión de código (usar ebzer-web)
- Para implementar filtros UI en header (usar ebzer-filtros)
- Para otras features no relacionadas con UX de orders

---

## Cómo Invocar un Agente

### En VS Code Copilot Chat

1. Presiona `Cmd+I` (Mac) o `Ctrl+I` (Windows/Linux)
2. Escribe `@workspace` y menciona el agente por su nombre
3. Describe tu tarea

**Ejemplos**:

```
@workspace usa el agente ebzer-web para auditar la arquitectura actual
```

```
@workspace invoca el agente ebzer-filtros para comenzar la implementación
```

### Por Nombre en Conversación

Si el agente está configurado como `user-invocable: true`, puedes invocarlo directamente:

```
ebzer-web: audita el componente OrdersTable
```

```
ebzer-filtros: comienza la fase 1
```

```
ebzer-orders-ux: comienza la implementación
```

---

## Estructura de Agentes

Los agentes están definidos en archivos Markdown con frontmatter YAML:

```yaml
---
description: "Descripción del agente"
model: "Claude Sonnet 4.5"
tools: [lista, de, herramientas]
user-invocable: true
---
```

Seguido del contenido del prompt del agente.

---

## Crear Nuevos Agentes

Para agregar un nuevo agente:

1. Crea un archivo `.agent.md` en `.github/agents/`
2. Define frontmatter YAML con descripción, modelo y tools
3. Escribe el prompt del agente (rol, contexto, reglas, workflow)
4. Registra el agente en este archivo (AGENTS.md)

**Plantilla básica**:

```markdown
---
description: "Descripción breve del agente"
model: "Claude Sonnet 4.5"
tools: [edit/editFiles, read/readFile, search/textSearch]
user-invocable: true
---

# Role
Descripción del rol del agente...

# Context
Contexto del proyecto...

# Workflow
Cómo debe trabajar el agente...
```

---

## Mejores Prácticas

### Para Agentes de Review
- ❌ No editar código directamente
- ✅ Producir findings accionables
- ✅ Proponer soluciones, no implementarlas
- ✅ Documentar riesgos y trade-offs

### Para Agentes de Implementation
- ✅ Editar código directamente
- ✅ Seguir planes documentados
- ✅ Verificar cada cambio
- ✅ Reportar progreso claramente
- ❌ No desviarse del plan sin confirmar

### Para Todos los Agentes
- ✅ Usar el sistema de diseño del proyecto
- ✅ Seguir convenciones de código existentes
- ✅ Mantener consistencia con la arquitectura
- ✅ Documentar decisiones importantes
- ❌ No agregar dependencias sin justificación

---

## Soporte y Contribuciones

Para reportar problemas o sugerir mejoras a los agentes:

1. Describe el problema o mejora propuesta
2. Indica qué agente está afectado
3. Proporciona contexto y ejemplos si aplica

Para contribuir con nuevos agentes, asegúrate de:
- Definir un propósito claro y específico
- No duplicar funcionalidad de agentes existentes
- Seguir las convenciones del proyecto
- Documentar el agente en este archivo
