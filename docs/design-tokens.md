# Sistema de Color

Este proyecto usa colores semánticos. La regla es simple: los componentes no deberían elegir `red`, `lime`, `emerald` o similares por intención visual aislada; deberían usar un token del sistema.

## Fuente de verdad

Los tokens viven en [src/index.css](/home/jair/ebzer/ebzer-web/src/index.css) dentro de `@layer theme`.

## Paleta semántica

- `primary`: color de marca y jerarquía principal. Está anclado al rosado del header de la tabla de pedidos (`bg-red-200/60`).
- `secondary`: acciones positivas suaves o estados completados de baja tensión.
- `accent`: confirmaciones principales y acciones de avance como guardar o crear.
- `info`: estados intermedios o neutros que necesitan destacar sin parecer éxito o error.
- `danger`: acciones destructivas o irreversibles.

## Reglas de uso

- Usa `primary` para navegación activa, headers destacados, foco visual y superficies de marca.
- Usa `secondary` para acciones positivas suaves, CTAs livianos y estados completados.
- Usa `accent` para la acción principal de formularios o confirmaciones positivas.
- Usa `info` para estados informativos, badges neutrales o procesos en curso.
- Usa `danger` solo para finalizar, eliminar, cancelar irreversible o advertencias fuertes.

## Utilidades disponibles

- Fondos: `bg-primary-soft`, `bg-primary-strong`, `bg-secondary-soft`, `bg-secondary-strong`, `bg-info-soft`, `bg-info-strong`, `bg-accent`, `bg-danger`
- Texto: `text-primary`, `text-secondary`, `text-info`, `text-accent-foreground`, `text-danger-foreground`
- Botones: `btn-primary`, `btn-secondary`, `btn-ternary`, `btn-info`, `btn-danger`
- Superficies y foco: `surface-primary`, `focus-primary`

## Convenciones de componentes

- Botón principal de submit: `btn-base btn-ternary`
- Botón secundario visible pero no dominante: `btn-base btn-secondary`
- Acción importante de marca: `btn-base btn-primary`
- Acción destructiva: `btn-base btn-danger`
- Header de tabla de pedidos: `bg-primary-soft`
- Estado `pending`: `bg-primary-strong`
- Estado `completed`: `bg-secondary-soft`
- Estado intermedio o fallback: `bg-info-soft`

## Qué evitar

- No hardcodear clases como `bg-red-400`, `text-red-900`, `bg-lime-200`, `bg-emerald-300`.
- No inventar un color nuevo para resolver un caso que ya cabe en `primary`, `secondary`, `accent`, `info` o `danger`.
- Si aparece una nueva intención visual real, primero agrégala al sistema y luego úsala en componentes.
