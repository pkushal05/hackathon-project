import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { authApi } from "../api/client";
import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import SectionHeader from "../components/ui/SectionHeader";
import DataTable from "../components/ui/DataTable";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminApprovals() {
  const queryClient = useQueryClient();

  const pendingQuery = useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: authApi.getPendingUsers,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => authApi.approveUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const denyMutation = useMutation({
    mutationFn: (id) => authApi.denyUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: authApi.getUsers,
    refetchInterval: 30000,
  });

  const makeAdminMutation = useMutation({
    mutationFn: (id) => authApi.makeAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const pendingUsers = pendingQuery.data?.data || [];
  const users = usersQuery.data?.data || [];
  const adminCount = users.filter((user) => user.role === "admin").length;

  const columns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      {
        key: "createdAt",
        header: "Requested At",
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: "action",
        header: "Action",
        render: (row) => (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => approveMutation.mutate(row._id)}
              disabled={approveMutation.isPending || denyMutation.isPending}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => denyMutation.mutate(row._id)}
              disabled={approveMutation.isPending || denyMutation.isPending}
            >
              Deny
            </button>
          </div>
        ),
      },
    ],
    [approveMutation, denyMutation],
  );

  const usersColumns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      {
        key: "isApproved",
        header: "Approval",
        render: (row) => {
          if (row.isDenied) return "Denied";
          return row.isApproved ? "Approved" : "Pending";
        },
      },
      {
        key: "role",
        header: "Role",
        render: (row) => (row.role === "admin" ? "Admin" : "User"),
      },
      {
        key: "action",
        header: "Admin Access",
        render: (row) => {
          if (row.role === "admin") {
            return <span className="card-muted">Already admin</span>;
          }

          if (row.isDenied) {
            return <span className="card-muted">Denied request</span>;
          }

          return (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => makeAdminMutation.mutate(row._id)}
              disabled={makeAdminMutation.isPending}
            >
              Make Admin
            </button>
          );
        },
      },
    ],
    [makeAdminMutation],
  );

  return (
    <PageContainer
      title="Admin User Approvals"
      subtitle="Approve newly registered users before granting platform access"
      actions={
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => pendingQuery.refetch()}
          disabled={pendingQuery.isFetching}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <RefreshCw
              size={14}
              className={pendingQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </span>
        </button>
      }
    >
      <section className="dashboard-grid-4">
        <DashboardCard>
          <p className="metric-label">Pending Requests</p>
          <p className="metric-value" style={{ color: "#f97316" }}>
            {pendingUsers.length}
          </p>
        </DashboardCard>
        <DashboardCard>
          <p className="metric-label">Approval Mode</p>
          <p
            className="metric-value"
            style={{ color: "#22c55e", fontSize: "1.4rem" }}
          >
            Manual
          </p>
        </DashboardCard>
        <DashboardCard>
          <p className="metric-label">Total Admins</p>
          <p className="metric-value" style={{ color: "#3b82f6" }}>
            {adminCount}
          </p>
        </DashboardCard>
      </section>

      <DashboardCard>
        <SectionHeader
          title="Pending Users"
          actions={
            approveMutation.isPending || denyMutation.isPending ? (
              <span className="card-muted">Processing approval...</span>
            ) : null
          }
        />

        {pendingQuery.isLoading ? (
          <p className="card-muted">Loading pending users...</p>
        ) : pendingQuery.error ? (
          <p className="auth-error" style={{ margin: 0 }}>
            {pendingQuery.error.message || "Failed to load pending users"}
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={pendingUsers}
            emptyText="No pending approvals."
          />
        )}
      </DashboardCard>

      <DashboardCard>
        <SectionHeader
          title="All Users"
          actions={
            makeAdminMutation.isPending ? (
              <span className="card-muted">Updating role...</span>
            ) : null
          }
        />

        {usersQuery.isLoading ? (
          <p className="card-muted">Loading users...</p>
        ) : usersQuery.error ? (
          <p className="auth-error" style={{ margin: 0 }}>
            {usersQuery.error.message || "Failed to load users"}
          </p>
        ) : (
          <DataTable
            columns={usersColumns}
            data={users}
            emptyText="No users found."
          />
        )}
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="Approval Guidance" />
        <div style={{ display: "grid", gap: 10 }}>
          <div className="card-muted">
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <ShieldCheck size={14} />
              Review each request carefully before approval.
            </span>
          </div>
          <div className="card-muted">
            Approved users can sign in immediately and access all non-admin
            pages.
          </div>
          <div className="card-muted">
            Promoting a user to admin grants access to this approvals workspace.
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
