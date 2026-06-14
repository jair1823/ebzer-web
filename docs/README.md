# Documentación Ebzer Web

Bienvenido a la documentación del frontend de Ebzer, aplicación web para gestión de órdenes, ingresos y gastos.

## Contenido

### Documentación Base
- [Tecnologías](./tecnologias.md) - Stack tecnológico y herramientas utilizadas
- [Arquitectura](./arquitectura.md) - Estructura del proyecto y flujo de datos
- [Sistema de Color](./design-tokens.md) - Tokens semánticos y reglas de uso

### Planes de Implementación
- [Sistema de Filtros para Pedidos](./plan-filtros-pedidos.md) - Plan completo dividido en 3 fases
  - [Fase 1: Estructura y Estado](./fase-1-filtros-estructura-estado.md)
  - [Fase 2: UI del Header](./fase-2-filtros-ui-header.md)
  - [Fase 3: Refinamiento](./fase-3-filtros-refinamiento.md)

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Desarrollo con acceso desde red local
npm run dev:host

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Variables de Entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Estado de la Documentación

- [ ] Componentes principales
- [x] Guía de estilos (color semántico)
- [ ] Hooks personalizados
- [ ] Gestión de estado
- [ ] Testing
- [ ] Deployment
