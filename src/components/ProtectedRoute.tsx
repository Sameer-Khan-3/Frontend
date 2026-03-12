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
    return <div className="text-center p-10">Checking session...</div>;
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
