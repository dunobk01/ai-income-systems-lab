import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { StubPage } from "./course";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — AI Income Systems Lab" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);
  if (!isAdmin) return null;
  return <StubPage title="Admin Dashboard" desc="Manage modules, lessons, prompts, users, and purchases. Activates in the admin build pass." />;
}
