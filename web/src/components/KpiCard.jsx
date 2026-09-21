export default function KpiCard({ label, value, delta }) {
  return (
    <div className="card kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      <div className="kpi__delta">{delta}</div>
    </div>
  );
}
