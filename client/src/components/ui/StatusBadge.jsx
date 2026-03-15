const DEFAULT_MAP = {
  healthy: "success",
  active: "success",
  operating: "success",
  good: "success",
  due: "warning",
  warning: "warning",
  inactive: "warning",
  soon: "warning",
  low: "warning",
  medium: "warning",
  high: "orange",
  overdue: "danger",
  critical: "danger",
  maintenance: "orange",
  retired: "slate",
  unknown: "slate",
  info: "slate",
};

export default function StatusBadge({ value, variant }) {
  const normalized = String(value || "").toLowerCase();
  const resolvedVariant = variant || DEFAULT_MAP[normalized] || "slate";

  return (
    <span className={`status-badge status-${resolvedVariant}`}>
      {value || "Unknown"}
    </span>
  );
}
