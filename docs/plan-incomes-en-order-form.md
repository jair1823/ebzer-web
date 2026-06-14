# Plan: Integrar Incomes en Order Form

**Fecha**: 19 de abril, 2026  
**Objetivo**: Reemplazar la sección de "Recomendaciones" por una tabla lite de incomes dentro del formulario de pedidos  

---

## 📋 Resumen Ejecutivo

Modificar `CreateOrderForm.tsx` para:

1. ✅ **Eliminar** la sección de "Recomendaciones"
2. ✅ **Agregar** una tabla lite de incomes en su lugar
3. ✅ **Mostrar** ingresos existentes (al editar) o permitir agregar nuevos
4. ✅ **UI dinámica** que muestra inputs cuando no hay ingresos
5. ✅ **Integración** con el API de incomes

---

## 🎯 Casos de Uso

### Caso 1: Crear Nuevo Pedido
**Comportamiento**:
- Usuario llena datos del pedido
- En la sección de incomes:
  - Muestra una fila con inputs para agregar el primer pago
  - Campos: `amount` (monto) y `date` (fecha opcional)
  - Botón `+` para agregar el ingreso a la lista temporal
- Una vez agregado:
  - Se muestra como fila en la tabla (monto + fecha)
  - Los inputs pasan a la última posición (nueva fila)
  - Puede agregar más ingresos
- Al guardar pedido:
  1. Se crea la orden en el backend (POST /api/orders)
  2. Se obtiene el `order_id` de la respuesta
  3. Se crean todos los ingresos de la lista temporal (POST /api/incomes por cada uno)

### Caso 2: Editar Pedido Existente
**Comportamiento**:
- Al abrir el modal de edición:
  - Se cargan los ingresos existentes del pedido (GET /api/incomes con filtro order_id)
  - Se muestran en la tabla
  - Al final: inputs para agregar más ingresos
- Puede agregar más ingresos a la lista
- Al guardar:
  1. Se actualiza la orden (PUT /api/orders/:id)
  2. Se crean solo los nuevos ingresos agregados (POST /api/incomes)

---

## 🏗️ Estructura de Datos

### Estado Temporal de Ingresos

```typescript
interface TemporaryIncome {
  id: string; // UUID temporal para react keys
  amount: number;
  date: string | null; // YYYY-MM-DD format
  isExisting: boolean; // true si viene del backend, false si es nuevo
}

// Estado en el componente
const [incomes, setIncomes] = useState<TemporaryIncome[]>([]);
const [newIncomeAmount, setNewIncomeAmount] = useState<number>(0);
const [newIncomeDate, setNewIncomeDate] = useState<string>("");
```

### Flujo de Datos

```
CREAR PEDIDO:
1. Usuario agrega ingresos → incomes[] (todos isExisting: false)
2. Submit form → createOrder() → obtiene order_id
3. Loop incomes → createIncome() para cada uno

EDITAR PEDIDO:
1. selectedOrder existe → cargar incomes del backend
2. setIncomes(existingIncomes.map(i => ({ ...i, isExisting: true })))
3. Usuario agrega más → push al array (isExisting: false)
4. Submit → updateOrder() + createIncome() solo para los nuevos
```

---

## 🎨 Diseño UI

### Layout de la Sección

```
┌─────────────────────────────────────┐
│  Pagos recibidos                    │  ← Título
├─────────────────────────────────────┤
│  MONTO          FECHA         ⚙️    │  ← Headers (si hay datos)
├─────────────────────────────────────┤
│  ₡5,000.00     18 Abr 2026   🗑️    │  ← Fila existente
│  ₡3,000.00     19 Abr 2026   🗑️    │  ← Fila existente
├─────────────────────────────────────┤
│  [_______]     [________]     ➕    │  ← Inputs siempre al final
└─────────────────────────────────────┘

Si no hay datos:
┌─────────────────────────────────────┐
│  Pagos recibidos                    │
├─────────────────────────────────────┤
│  [_______]     [________]     ➕    │  ← Solo inputs
│  Monto         Fecha                │  ← Labels debajo
└─────────────────────────────────────┘
```

### Componentes Visuales

1. **Fila de Ingreso Existente**
   - Monto formateado (₡X,XXX.XX)
   - Fecha formateada (DD MMM YYYY)
   - Botón eliminar (🗑️) - solo para ingresos nuevos (isExisting: false)
   - Ingresos existentes no se pueden eliminar desde aquí

2. **Fila de Input (siempre última)**
   - Input number para monto
   - Input date para fecha
   - Botón `+` para agregar a la lista

---

## 📦 Archivos a Modificar

### 1. `src/pages/orders/CreateOrderForm.tsx`

**Cambios**:
- ✅ Importar `incomesService` y tipos
- ✅ Agregar estado para incomes temporales
- ✅ Agregar funciones para agregar/eliminar incomes
- ✅ Eliminar sección de "Recomendaciones"
- ✅ Agregar nueva sección "Pagos recibidos"
- ✅ Modificar `handleSubmit` para crear incomes después de la orden
- ✅ Modificar `useEffect` para cargar incomes al editar

**Nuevas funciones**:

```typescript
// Cargar incomes existentes al editar
const loadIncomes = async (orderId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/incomes?order_id=${orderId}`);
    const data = await response.json();
    setIncomes(data.map((income: Income) => ({
      id: `existing-${income.id}`,
      amount: income.amount,
      date: income.date ? new Date(income.date).toISOString().split('T')[0] : null,
      isExisting: true,
      backendId: income.id
    })));
  } catch (error) {
    console.error("Error loading incomes:", error);
  }
};

// Agregar nuevo income a la lista temporal
const handleAddIncome = () => {
  if (newIncomeAmount > 0) {
    const newIncome: TemporaryIncome = {
      id: `temp-${Date.now()}`,
      amount: newIncomeAmount,
      date: newIncomeDate || null,
      isExisting: false
    };
    setIncomes([...incomes, newIncome]);
    setNewIncomeAmount(0);
    setNewIncomeDate("");
  }
};

// Eliminar income de la lista temporal (solo nuevos)
const handleRemoveIncome = (id: string) => {
  setIncomes(incomes.filter(income => income.id !== id));
};
```

---

## 🔄 Flujo de Guardado Modificado

### handleSubmit (versión mejorada)

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    const dataToSend = {
      description: formData.description,
      amount_charged: formData.amount_charged,
      status: formData.status,
      estimated_delivery_date: formData.estimated_delivery_date
        ? new Date(formData.estimated_delivery_date).toISOString()
        : null,
      delivery_type: formData.delivery_type,
      client_name: formData.client_name,
      client_phone: formData.client_phone || "",
      notes: formData.notes || "",
    };

    let orderId: number;

    if (selectedOrder) {
      // EDITAR: actualizar orden
      await updateOrder(selectedOrder.id, dataToSend);
      orderId = selectedOrder.id;
      showSuccess("Pedido actualizado exitosamente");
    } else {
      // CREAR: crear orden y obtener ID
      const response = await createOrder(dataToSend);
      orderId = response.id;
      showSuccess("Pedido creado exitosamente");
    }

    // Crear solo los incomes nuevos (isExisting: false)
    const newIncomes = incomes.filter(income => !income.isExisting);
    
    for (const income of newIncomes) {
      await incomesService.createIncome({
        order_id: orderId,
        amount: income.amount,
        date: income.date || null
      });
    }

    if (newIncomes.length > 0) {
      showSuccess(`${newIncomes.length} pago(s) registrado(s)`);
    }

    // Reset y cerrar
    setFormData(initialFormData);
    setIncomes([]);
    toggleModal();
  } catch (error) {
    console.error("Error submitting form:", error);
    showError(
      selectedOrder
        ? "Error al actualizar el pedido"
        : "Error al crear el pedido"
    );
  }
};
```

---

## 🎨 Código JSX de la Nueva Sección

```tsx
<section className="rounded-3xl surface-card p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
      Pagos recibidos
    </p>
    {incomes.length > 0 && (
      <span className="text-xs text-secondary">
        {incomes.length} pago{incomes.length !== 1 ? 's' : ''}
      </span>
    )}
  </div>

  <div className="space-y-2">
    {/* Mostrar incomes existentes */}
    {incomes.map((income) => (
      <div 
        key={income.id}
        className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 bg-surface border-default"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(income.amount)}
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-secondary">
            {income.date ? new Date(income.date).toLocaleDateString('es-CR') : 'Sin fecha'}
          </p>
        </div>
        <div className="flex-shrink-0">
          {!income.isExisting && (
            <button
              type="button"
              onClick={() => handleRemoveIncome(income.id)}
              className="text-danger hover:text-danger-hover p-1"
              aria-label="Eliminar pago"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    ))}

    {/* Input row - siempre al final */}
    <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 bg-surface-elevated border-subtle">
      <div className="flex-1">
        <input
          type="number"
          min="0"
          step="0.01"
          value={newIncomeAmount || ""}
          onChange={(e) => setNewIncomeAmount(Number(e.target.value))}
          placeholder="Monto"
          className="input-base text-sm"
        />
      </div>
      <div className="flex-1">
        <input
          type="date"
          value={newIncomeDate}
          onChange={(e) => setNewIncomeDate(e.target.value)}
          className="input-base text-sm"
        />
      </div>
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleAddIncome}
          disabled={newIncomeAmount <= 0}
          className="rounded-lg bg-brand-primary text-white p-2 hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Agregar pago"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    {incomes.length === 0 && (
      <p className="text-xs text-center text-tertiary mt-2">
        Agrega los pagos recibidos de este pedido
      </p>
    )}
  </div>
</section>
```

---

## ⚠️ Consideraciones Importantes

### 1. **Orden de Operaciones al Crear**

Secuencia crítica:
```
1. POST /api/orders → obtener { id: 123 }
2. POST /api/incomes con order_id: 123 (repetir para cada income)
```

Si falla la creación de la orden, NO se crean incomes.  
Si falla un income, continuar con los demás (usar try-catch por separado).

### 2. **Validación de Datos**

- Monto debe ser > 0
- Fecha es opcional (backend acepta null)
- Si no hay incomes, no es error (pedidos sin anticipo son válidos)

### 3. **UX / Feedback**

- Toast al crear orden: "Pedido creado exitosamente"
- Toast al crear incomes: "3 pago(s) registrado(s)"
- Si falla un income específico, mostrar warning pero no bloquear

### 4. **Performance**

- Al editar, cargar incomes solo una vez (useEffect con selectedOrder.id)
- No hacer fetch en cada render
- Usar IDs temporales únicos para keys de React

### 5. **Edge Cases**

**Q**: ¿Qué pasa si edito una orden y elimino todos los incomes?  
**A**: No hacemos DELETE desde aquí. Solo podemos agregar nuevos. Para eliminar, ir a la página de Incomes.

**Q**: ¿Puedo editar un income existente desde aquí?  
**A**: No. Solo visualización + agregar nuevos. Editar desde la página de Incomes.

**Q**: ¿Qué pasa si cierro el modal sin guardar?  
**A**: Se pierden los incomes temporales (no guardados). Es el comportamiento esperado.

---

## 🧪 Casos de Prueba

### Test 1: Crear pedido sin incomes
- ✅ Crear pedido con datos mínimos
- ✅ No agregar ningún income
- ✅ Guardar → debe crear solo la orden

### Test 2: Crear pedido con 1 income
- ✅ Agregar monto: 5000, fecha: hoy
- ✅ Click en +
- ✅ Debe aparecer en la tabla
- ✅ Inputs deben limpiarse
- ✅ Guardar → orden + 1 income creados

### Test 3: Crear pedido con múltiples incomes
- ✅ Agregar 3 incomes diferentes
- ✅ Todos deben aparecer en la tabla
- ✅ Guardar → orden + 3 incomes creados

### Test 4: Editar pedido existente
- ✅ Abrir orden existente
- ✅ Deben cargar incomes existentes
- ✅ Agregar 1 income nuevo
- ✅ Guardar → solo se crea el nuevo income

### Test 5: Eliminar income temporal
- ✅ Agregar income nuevo
- ✅ Click en eliminar (🗑️)
- ✅ Debe desaparecer de la lista
- ✅ Input sigue disponible

### Test 6: Validación de monto
- ✅ Intentar agregar monto = 0
- ✅ Botón + debe estar deshabilitado
- ✅ Intentar con monto negativo
- ✅ Botón + debe estar deshabilitado

---

## 📍 Ubicación en el Código

### Sección a Eliminar (líneas ~516-528)
```tsx
<section className="rounded-3xl surface-card p-6 shadow-sm">
  <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
    Recomendaciones
  </p>
  <ul className="mt-4 space-y-3 text-sm leading-6 text-secondary">
    <li>Usa una descripción concreta...</li>
    <li>Si el cliente aún no confirmó...</li>
    <li>Revisa total, tipo de entrega...</li>
  </ul>
</section>
```

### Reemplazar por:
Nueva sección de "Pagos recibidos" (ver código JSX arriba)

---

## 📝 Checklist de Implementación

### Fase 1: Setup Estado y Funciones
- [ ] Agregar imports necesarios (incomesService, tipos)
- [ ] Definir interface `TemporaryIncome`
- [ ] Agregar estados: `incomes`, `newIncomeAmount`, `newIncomeDate`
- [ ] Implementar `loadIncomes()`
- [ ] Implementar `handleAddIncome()`
- [ ] Implementar `handleRemoveIncome()`
- [ ] Agregar `formatCurrency()` helper

### Fase 2: Modificar lógica existente
- [ ] Modificar `handleSubmit()` para crear incomes después de la orden
- [ ] Modificar `useEffect` para cargar incomes al editar
- [ ] Agregar manejo de errores específico para incomes

### Fase 3: UI
- [ ] Eliminar sección de "Recomendaciones"
- [ ] Agregar nueva sección "Pagos recibidos"
- [ ] Implementar filas de incomes existentes
- [ ] Implementar fila de input (siempre al final)
- [ ] Agregar botones + y 🗑️
- [ ] Estilizar con tokens del design system

### Fase 4: Testing
- [ ] Ejecutar todos los casos de prueba
- [ ] Verificar creación de orden + incomes
- [ ] Verificar edición de orden + agregar incomes
- [ ] Verificar validaciones funcionan
- [ ] Verificar UI responsive
- [ ] Verificar toast notifications

---

## 🚀 Próximos Pasos

1. Revisar y aprobar este plan
2. Implementar en orden: Fase 1 → Fase 2 → Fase 3 → Fase 4
3. Testear en desarrollo
4. Documentar cambios en CHANGELOG (si aplica)

---

**Estado**: ✅ Plan completo - Listo para implementación  
**Tiempo estimado**: 2-3 horas  
**Complejidad**: Media
