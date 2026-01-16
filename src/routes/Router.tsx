import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LoginPage } from "@/app/Login";
import { FilialDashboard } from "@/app/filial/Dashboard";
import { FilialPrestacoes } from "@/app/filial/Prestacoes";
import { FilialPrestacaoNova } from "@/app/filial/NovaPrestacao";
import { FilialPrestacaoDetalhe } from "@/app/filial/PrestacaoDetalhe";
import { SedeDashboard } from "@/app/sede/Dashboard";
import { SedePrestacoes } from "@/app/sede/Prestacoes";
import { SedePrestacaoDetalhe } from "@/app/sede/PrestacaoDetalhe";
import { SedeRelatorios } from "@/app/sede/Relatorios";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AppToaster } from "@/components/ui/toaster";

const Shell = () => (
  <>
    <AppShell />
    <AppToaster />
  </>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    element: <ProtectedRoute allow={["FILIAL", "SEDE"]} />,
    children: [
      {
        element: <Shell />,
        children: [
          {
            element: <ProtectedRoute allow={["FILIAL"]} />,
            children: [
              { path: "/filial/dashboard", element: <FilialDashboard /> },
              { path: "/filial/prestacoes", element: <FilialPrestacoes /> },
              { path: "/filial/prestacoes/nova", element: <FilialPrestacaoNova /> },
              { path: "/filial/prestacoes/:id", element: <FilialPrestacaoDetalhe /> }
            ]
          },
          {
            element: <ProtectedRoute allow={["SEDE"]} />,
            children: [
              { path: "/sede/dashboard", element: <SedeDashboard /> },
              { path: "/sede/prestacoes", element: <SedePrestacoes /> },
              { path: "/sede/prestacoes/:id", element: <SedePrestacaoDetalhe /> },
              { path: "/sede/relatorios", element: <SedeRelatorios /> }
            ]
          }
        ]
      }
    ]
  }
]);
