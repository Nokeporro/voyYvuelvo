import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Button from "../components/atoms/Button";
import AppLink from "../components/atoms/AppLink";
import FormField from "../components/molecules/FormField";
import ConfirmationPrompt from "../components/molecules/ConfirmationPrompt";
import RentalEquipmentList from "../components/organisms/RentalEquipmentList";
import { inspectAtomicDesign } from "../../scripts/lib/atomic-design";

describe("Contratos de los componentes atómicos", () => {
  it("el botón normal no envía un formulario accidentalmente", async () => {
    const submit = vi.fn((e) => e.preventDefault()),
      click = vi.fn();
    render(
      <form onSubmit={submit}>
        <Button onClick={click}>Acción</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Acción" }));
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });
  it("permite un botón explícito de envío y respeta disabled", async () => {
    const submit = vi.fn((e) => e.preventDefault());
    const { rerender } = render(
      <form onSubmit={submit}>
        <Button type="submit" disabled>
          Guardar
        </Button>
      </form>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <form onSubmit={submit}>
        <Button type="submit">Guardar</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(submit).toHaveBeenCalledOnce();
  });
  it("compone input, ayuda y error asociados a su etiqueta", () => {
    render(
      <FormField
        name="numero"
        label="Documento"
        value="incorrecto"
        onChange={() => {}}
        hint="Número de prueba"
        error="Documento inválido"
      />,
    );
    const input = screen.getByLabelText("Documento");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Número de prueba Documento inválido",
    );
  });
  it("renderiza select y textarea conservando valores y eventos", async () => {
    const change = vi.fn();
    render(
      <>
        <FormField name="pais" label="País" value="cl" onChange={change}>
          <option value="cl">Chile</option>
          <option value="fr">Francia</option>
        </FormField>
        <FormField
          name="mensaje"
          label="Mensaje"
          as="textarea"
          value="Hola"
          onChange={change}
        />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Mensaje" }).tagName).toBe(
      "TEXTAREA",
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "fr");
    expect(change).toHaveBeenCalled();
  });
  it("mantiene enlaces internos, externos y anclas", () => {
    render(
      <MemoryRouter>
        <AppLink to="/registro">Registro</AppLink>
        <AppLink href="https://example.org">Externo</AppLink>
        <AppLink href="#contenido">Saltar</AppLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Registro" })).toHaveAttribute(
      "href",
      "/registro",
    );
    expect(screen.getByRole("link", { name: "Externo" })).toHaveAttribute(
      "href",
      "https://example.org",
    );
    expect(screen.getByRole("link", { name: "Saltar" })).toHaveAttribute(
      "href",
      "#contenido",
    );
  });
  it("la confirmación delega acciones sin borrar datos por sí misma", async () => {
    const confirm = vi.fn(),
      cancel = vi.fn();
    render(
      <ConfirmationPrompt onConfirm={confirm} onCancel={cancel}>
        ¿Eliminar equipo?
      </ConfirmationPrompt>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Confirmar eliminación" }),
    );
    expect(confirm).toHaveBeenCalledOnce();
  });
  it("el organismo de arriendo entrega la selección sin mutar sus props", async () => {
    const selection = [2],
      change = vi.fn();
    render(
      <RentalEquipmentList
        equipment={[
          {
            id: 1,
            nombre: "Bastones",
            valorArriendo: 5000,
            imagen: "/img/bastones.png",
          },
        ]}
        selected={selection}
        onSelectionChange={change}
      />,
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Arrendar Bastones" }),
    );
    expect(change).toHaveBeenCalledWith([2, 1]);
    expect(selection).toEqual([2]);
  });
});

describe("Reglas de arquitectura Atomic Design", () => {
  it("detecta una molécula que importa un organismo", () => {
    const files = new Map([
      ["src/components/molecules/A.jsx", 'import B from "../organisms/B";'],
      ["src/components/organisms/B.jsx", "export default function B() {}"],
    ]);
    expect(inspectAtomicDesign(files)).toContain(
      "src/components/molecules/A.jsx: molecules no puede depender de organisms",
    );
  });
  it("detecta dependencia circular y lógica de servicios en átomos", () => {
    const files = new Map([
      [
        "src/components/atoms/A.jsx",
        'import B from "./B"; import api from "../../services/api";',
      ],
      ["src/components/atoms/B.jsx", 'import A from "./A";'],
      ["src/services/api.js", "export default {}"],
    ]);
    expect(inspectAtomicDesign(files).join("\n")).toMatch(
      /dependencia circular/,
    );
    expect(inspectAtomicDesign(files).join("\n")).toMatch(
      /recibir datos y acciones por props/,
    );
  });
  it("acepta la composición de una página con plantilla y controles atómicos", () => {
    const files = new Map([
      [
        "src/pages/A.jsx",
        'import PageTemplate from "../components/templates/PageTemplate";',
      ],
      [
        "src/components/templates/PageTemplate.jsx",
        'import Input from "../atoms/Input";',
      ],
      [
        "src/components/atoms/Input.jsx",
        "export default function Input(){return <input/>}",
      ],
    ]);
    expect(inspectAtomicDesign(files)).toEqual([]);
  });
});
