import { useCallback, useEffect, useState } from "react";
import { expensesService } from "../services/expenses.service";
import type {
  Comercio,
  ComercioFormData,
  Expense,
  ExpenseFilters,
  ExpenseFormData,
  Product,
  ProductFormData,
} from "../pages/expenses/types";

export const useExpenses = (filters: ExpenseFilters = {}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  const getAllExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await expensesService.getAllExpenses(filters);
      setExpenses(response);
      return response;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters.from, filters.to, filters.comercio_id]);

  const getComercios = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await expensesService.getComercios();
      setComercios(response);
      return response;
    } catch (error) {
      console.error("Error fetching comercios:", error);
      setComercios([]);
      return [];
    } finally {
      setCatalogLoading(false);
      setCatalogLoaded(true);
    }
  }, []);

  const getProducts = useCallback(async () => {
    try {
      const response = await expensesService.getProducts();
      setProducts(response);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      return [];
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    const [refreshedComercios, refreshedProducts] = await Promise.all([
      getComercios(),
      getProducts(),
    ]);
    return { comercios: refreshedComercios, products: refreshedProducts };
  }, [getComercios, getProducts]);

  const createExpense = async (expenseData: ExpenseFormData) => {
    const response = await expensesService.createExpense(expenseData);
    await Promise.all([getAllExpenses(), getProducts()]);
    return response;
  };

  const updateExpense = async (expenseId: number, expenseData: ExpenseFormData) => {
    const response = await expensesService.updateExpense(String(expenseId), expenseData);
    const [refreshedExpenses] = await Promise.all([getAllExpenses(), getProducts()]);
    setSelectedExpense(
      refreshedExpenses.find((expense) => expense.id === expenseId) || null
    );
    return response;
  };

  const deleteExpense = async (expenseId: number) => {
    const response = await expensesService.deleteExpense(String(expenseId));
    await getAllExpenses();
    return response;
  };

  const createComercio = async (comercioData: ComercioFormData) => {
    const response = await expensesService.createComercio(comercioData);
    await getComercios();
    return response;
  };

  const updateComercio = async (
    comercioId: number,
    comercioData: ComercioFormData
  ) => {
    const response = await expensesService.updateComercio(String(comercioId), comercioData);
    await Promise.all([getComercios(), getAllExpenses(), getProducts()]);
    return response;
  };

  const deleteComercio = async (comercioId: number) => {
    const response = await expensesService.deleteComercio(String(comercioId));
    await Promise.all([getComercios(), getProducts(), getAllExpenses()]);
    return response;
  };

  const createProduct = async (productData: ProductFormData) => {
    const response = await expensesService.createProduct(productData);
    await getProducts();
    return response;
  };

  const updateProduct = async (productId: number, productData: ProductFormData) => {
    const response = await expensesService.updateProduct(String(productId), productData);
    await Promise.all([getProducts(), getAllExpenses()]);
    return response;
  };

  const deleteProduct = async (productId: number) => {
    const response = await expensesService.deleteProduct(String(productId));
    await getProducts();
    return response;
  };

  useEffect(() => {
    getAllExpenses();
    refreshCatalog();
  }, [getAllExpenses, refreshCatalog]);

  return {
    expenses,
    comercios,
    products,
    loading,
    catalogLoading,
    catalogLoaded,
    selectedExpense,
    setSelectedExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    createComercio,
    updateComercio,
    deleteComercio,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
