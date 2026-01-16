import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ allow }: { allow: ("FILIAL" | "SEDE")[] }) {
  const role = useAuthStore((state) => state.role);
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (!allow.includes(role)) {
    return <Navigate to={role === "FILIAL" ? "/filial/dashboard" : "/sede/dashboard"} replace />;
  }
  return <Outlet />;
}
