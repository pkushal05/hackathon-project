export default function SectionHeader({ title, actions }) {
  return (
    <div className="section-header-row">
      <h2 className="section-title">{title}</h2>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
