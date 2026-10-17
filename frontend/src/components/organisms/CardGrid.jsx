export default function CardGrid({
  items,
  renderItem,
  columnClass = "col-md-6 col-xl-4",
  className = "row g-4",
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div className={columnClass} key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
