import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/common/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tropels from "./pages/Tropels";
import Signals from "./pages/Signals";
import SignalDetail from "./pages/SignalDetail";
import Sectors from "./pages/Sectors";
import SectorStory from "./pages/SectorStory";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/tropels", element: <Tropels /> },
      { path: "/signals", element: <Signals /> },
      { path: "/signals/:id", element: <SignalDetail /> },
      { path: "/sectors", element: <Sectors /> },
      { path: "/sectors/:id/story", element: <SectorStory /> },
    ],
  },
]);
