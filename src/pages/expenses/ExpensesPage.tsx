import React from "react";

export const ExpensesPage: React.FC = () => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Gastos
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Gestiona todos tus gastos y egresos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/40 p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Módulo de Gastos
            </h3>
            <p className="text-slate-600">
              Funcionalidad próximamente disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
