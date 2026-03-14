import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { maintenanceApi } from "../api/client";
import Modal from "../components/Modal";
import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import DataTable from "../components/ui/DataTable";
import FormField from "../components/ui/FormField";
import StatusBadge from "../components/ui/StatusBadge";

const emptyRecord = {
  busAlias: "",
  pmNumber: "",
  serviceType: "",
  urgencyScore: 0,
  lastOdometerReading: 0,
  unitsToGoKm: 0,
  unitsLateKm: 0,
  daysLate: 0,
  reportDate: "",
};

function urgencyVariant(score) {
  if (score >= 80) return "danger";
  if (score >= 60) return "orange";
  if (score >= 40) return "warning";
  return "success";
}

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyRecord);

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => maintenanceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: maintenanceApi.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
  });

  const rows = (data?.data || []).filter((item) => {
    const q = String(search || "").toLowerCase();
    const busAlias = String(item?.busAlias ?? "").toLowerCase();
    const serviceType = String(item?.serviceType ?? "").toLowerCase();
    const pmNumber = String(item?.pmNumber ?? "").toLowerCase();

    return (
      busAlias.includes(q) || serviceType.includes(q) || pmNumber.includes(q)
    );
  });

  function openCreate() {
    setEditingRecord(null);
    setForm(emptyRecord);
    setIsModalOpen(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    setForm({
      ...record,
      reportDate: record.reportDate
        ? new Date(record.reportDate).toISOString().split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingRecord(null);
    setForm(emptyRecord);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord._id, payload: form });
      return;
    }
    createMutation.mutate(form);
  }

  const columns = [
    { key: "busAlias", header: "Bus" },
    { key: "pmNumber", header: "PM Number" },
    { key: "serviceType", header: "Service" },
    {
      key: "urgencyScore",
      header: "Urgency",
      render: (row) => (
        <StatusBadge
          value={`Score ${row.urgencyScore || 0}`}
          variant={urgencyVariant(row.urgencyScore || 0)}
        />
      ),
    },
    {
      key: "lastOdometerReading",
      header: "Odometer",
      render: (row) =>
        `${Number(row.lastOdometerReading || 0).toLocaleString()} km`,
    },
    {
      key: "unitsToGoKm",
      header: "To Go",
      render: (row) => `${Number(row.unitsToGoKm || 0).toLocaleString()} km`,
    },
    {
      key: "unitsLateKm",
      header: "Overdue",
      render: (row) => `${Number(row.unitsLateKm || 0).toLocaleString()} km`,
    },
    {
      key: "daysLate",
      header: "Days Late",
      render: (row) => `${row.daysLate || 0} d`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={() => openEdit(row)}>
            <Pencil size={14} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              if (confirm("Delete this record?")) {
                deleteMutation.mutate(row._id);
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Maintenance"
      subtitle="Preventive maintenance and urgency monitoring"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={14} />
            Add Record
          </span>
        </button>
      }
    >
      <DashboardCard>
        <input
          className="search-input"
          placeholder="Search by bus alias, PM number, or service"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </DashboardCard>

      <DashboardCard>
        {isLoading ? (
          <p className="card-muted">Loading maintenance records...</p>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            emptyText="No maintenance records found"
          />
        )}
      </DashboardCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingRecord ? "Edit Maintenance Record" : "Add Maintenance Record"
        }
      >
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="Bus Alias"
              value={form.busAlias}
              onChange={(value) => setForm({ ...form, busAlias: value })}
              required
            />
            <FormField
              label="PM Number"
              value={form.pmNumber}
              onChange={(value) => setForm({ ...form, pmNumber: value })}
            />
            <FormField
              label="Service Type"
              value={form.serviceType}
              onChange={(value) => setForm({ ...form, serviceType: value })}
            />
            <FormField
              label="Urgency Score"
              type="number"
              value={form.urgencyScore}
              onChange={(value) =>
                setForm({ ...form, urgencyScore: Number(value) })
              }
            />
            <FormField
              label="Last Odometer"
              type="number"
              value={form.lastOdometerReading}
              onChange={(value) =>
                setForm({ ...form, lastOdometerReading: Number(value) })
              }
            />
            <FormField
              label="Units To Go (km)"
              type="number"
              value={form.unitsToGoKm}
              onChange={(value) =>
                setForm({ ...form, unitsToGoKm: Number(value) })
              }
            />
            <FormField
              label="Units Late (km)"
              type="number"
              value={form.unitsLateKm}
              onChange={(value) =>
                setForm({ ...form, unitsLateKm: Number(value) })
              }
            />
            <FormField
              label="Days Late"
              type="number"
              value={form.daysLate}
              onChange={(value) =>
                setForm({ ...form, daysLate: Number(value) })
              }
            />
            <FormField
              label="Report Date"
              type="date"
              value={form.reportDate}
              onChange={(value) => setForm({ ...form, reportDate: value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingRecord ? "Save Changes" : "Create Record"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
