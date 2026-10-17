import Button from "../atoms/Button";
import Select from "../atoms/Select";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
import Heading from "../atoms/Heading";
import { useState } from "react";
import { tomorrow } from "../../utils/validation.js";
export default function RouteSearchForm({ onSearch }) {
  const [query, setQuery] = useState("");
  return (
    <form
      className="search-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSearch(new URLSearchParams(data));
      }}
    >
      <Heading as="h2" className="h4 mb-4">
        ¿A dónde vamos?
      </Heading>
      <Label htmlFor="destino" className="form-label">
        Destino o región
      </Label>
      <Input
        className="form-control mb-3"
        id="destino"
        name="destino"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Destino o región"
        maxLength="100"
      />
      <Label className="form-label" htmlFor="fecha">
        Fecha
      </Label>
      <Input
        className="form-control mb-3"
        id="fecha"
        name="fecha"
        type="date"
        min={tomorrow()}
        required
      />
      <Label className="form-label" htmlFor="personas">
        Personas
      </Label>
      <Select
        className="form-select mb-4"
        id="personas"
        name="personas"
        defaultValue="2"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </Select>
      <Button type="submit" className="btn btn-warning w-100">
        Buscar rutas →
      </Button>
    </form>
  );
}
