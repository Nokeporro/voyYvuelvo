import Select from "../atoms/Select";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
export default function ProductFilters({
  query,
  onQueryChange,
  difficulty,
  onDifficultyChange,
}) {
  return (
    <div className="row g-3 my-3">
      <div className="col-md-8">
        <Label className="form-label" htmlFor="buscar-productos">
          Buscar productos
        </Label>
        <Input
          id="buscar-productos"
          className="form-control"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          type="search"
        />
      </div>
      <div className="col-md-4">
        <Label className="form-label" htmlFor="dificultad">
          Dificultad recomendada
        </Label>
        <Select
          id="dificultad"
          className="form-select"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="facil">Fácil</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </Select>
      </div>
    </div>
  );
}
