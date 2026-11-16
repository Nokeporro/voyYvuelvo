import Text from "../atoms/Text";

export default function StatCard({ value, label }) {
  return (
    <div className="form-panel">
      <strong className="display-5">{value}</strong>
      <Text className="mb-0">{label}</Text>
    </div>
  );
}
