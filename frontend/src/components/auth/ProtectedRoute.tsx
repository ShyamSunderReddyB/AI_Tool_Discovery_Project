import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (requireAdmin && user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, requireAdmin, navigate]);

  if (!user || (requireAdmin && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
