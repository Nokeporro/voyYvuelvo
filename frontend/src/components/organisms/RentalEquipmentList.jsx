import RentalOption from "../molecules/RentalOption";

export default function RentalEquipmentList({
  equipment,
  selected,
  onSelectionChange,
}) {
  return (
    <div className="row g-3">
      {equipment.map((item) => (
        <div className="col-sm-6" key={item.id}>
          <RentalOption
            item={item}
            selected={selected.includes(item.id)}
            onChange={(checked) =>
              onSelectionChange(
                checked
                  ? [...selected, item.id]
                  : selected.filter((id) => id !== item.id),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
