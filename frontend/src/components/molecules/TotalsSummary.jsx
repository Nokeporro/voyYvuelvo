export default function TotalsSummary({ items }) {
  return (
    <dl className="totals">
      {items.map(({ label, value, emphasis }) => (
        <div className="total-pair" key={label}>
          <dt>{label}</dt>
          <dd>{emphasis ? <strong>{value}</strong> : value}</dd>
        </div>
      ))}
    </dl>
  );
}
