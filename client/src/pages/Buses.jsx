import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { busesApi } from "../api/client";
import Modal from "../components/Modal";
import PageContainer from "../components/ui/PageContainer";
import DashboardCard from "../components/ui/DashboardCard";
import DataTable from "../components/ui/DataTable";
import FormField from "../components/ui/FormField";
import StatusBadge from "../components/ui/StatusBadge";

const emptyBus = {
  busNumber: "",
  alias: "",
  manufacturer: "",
  year: "",
  garage: "",
  status: "Operating",
};

function normalizeStatus(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  const map = {
    active: "Operating",
    operating: "Operating",
    inactive: "Inactive",
    maintenance: "Maintenance",
    retired: "Retired",
  };
  return map[normalized] || "Operating";
}

export default function Buses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [form, setForm] = useState(emptyBus);

  const { data, isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: busesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: busesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => busesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: busesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["buses"] }),
  });

  const buses = (data?.data || []).filter((bus) => {
    const q = search.toLowerCase();
    return (
      bus.busNumber?.toLowerCase().includes(q) ||
      bus.alias?.toLowerCase().includes(q) ||
      bus.manufacturer?.toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditingBus(null);
    setForm(emptyBus);
    setIsModalOpen(true);
  }

  function openEdit(bus) {
    setEditingBus(bus);
    setForm({ ...bus, status: normalizeStatus(bus.status) || "Operating" });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingBus(null);
    setForm(emptyBus);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      status: normalizeStatus(form.status) || "Operating",
    };
    if (editingBus) {
      updateMutation.mutate({ id: editingBus._id, payload });
      return;
    }
    createMutation.mutate(payload);
  }

  const columns = [
    { key: "busNumber", header: "Bus Number" },
    { key: "alias", header: "Alias" },
    { key: "manufacturer", header: "Manufacturer" },
    { key: "year", header: "Year" },
    { key: "garage", header: "Garage" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge value={row.status || "Unknown"} />,
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
              if (confirm("Delete this bus?")) {
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
      title="Buses"
      subtitle="Fleet inventory and status management"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={14} />
            Add Bus
          </span>
        </button>
      }
    >
      <DashboardCard>
        <div className="search-row">
          <input
            className="search-input"
            placeholder="Search by bus number, alias, or manufacturer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </DashboardCard>

      <DashboardCard>
        {isLoading ? (
          <p className="card-muted">Loading buses...</p>
        ) : (
          <DataTable
            columns={columns}
            data={buses}
            emptyText="No buses available"
          />
        )}
      </DashboardCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBus ? "Edit Bus" : "Add Bus"}
      >
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="Bus Number"
              value={form.busNumber}
              onChange={(value) => setForm({ ...form, busNumber: value })}
              required
            />
            <FormField
              label="Alias"
              value={form.alias}
              onChange={(value) => setForm({ ...form, alias: value })}
              required
            />
            <FormField
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(value) => setForm({ ...form, manufacturer: value })}
            />
            <FormField
              label="Year"
              type="number"
              value={form.year}
              onChange={(value) => setForm({ ...form, year: value })}
            />
            <FormField
              label="Garage"
              value={form.garage}
              onChange={(value) => setForm({ ...form, garage: value })}
            />
          </div>
          <FormField
            label="Status"
            type="select"
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={[
              { value: "Operating", label: "Operating" },
              { value: "Inactive", label: "Inactive" },
              { value: "Maintenance", label: "Maintenance" },
              { value: "Retired", label: "Retired" },
            ]}
          />
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingBus ? "Save Changes" : "Create Bus"}
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
