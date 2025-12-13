import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { OrdersPage, IncomesPage, ExpensesPage } from "./pages";
import { DashboardLayout } from "./layouts/DashboardLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <OrdersPage />,
      },
      {
        path: "incomes",
        element: <IncomesPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
