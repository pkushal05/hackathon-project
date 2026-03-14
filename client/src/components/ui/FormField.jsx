export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options,
  min,
  max,
  rows = 4,
  className = "",
}) {
  const baseProps = {
    value,
    required,
    placeholder,
    min,
    max,
    onChange: (event) => onChange(event.target.value),
  };

  return (
    <div className={`form-field ${className}`.trim()}>
      <label className="form-label">{label}</label>
      {type === "select" ? (
        <select className="form-control" {...baseProps}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {type === "textarea" ? (
        <textarea className="form-control" rows={rows} {...baseProps} />
      ) : null}

      {type !== "select" && type !== "textarea" ? (
        <input className="form-control" type={type} {...baseProps} />
      ) : null}
    </div>
  );
}
