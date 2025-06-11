import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

export default function PrivateRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const role = getUserRole();
  if (!role) return <Navigate to="/login" replace />;
  if (!roles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
