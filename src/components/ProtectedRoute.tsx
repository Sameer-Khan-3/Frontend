import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppRole } from "../utils/role";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--surface) text-(--text)">
        <div className="flex flex-col items-center" role="status" aria-live="polite">
          <div
            className="h-10 w-10 rounded-full border-4 border-(--border) border-t-(--accent) animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Loading</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/error" replace state={{ status: 403, from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

