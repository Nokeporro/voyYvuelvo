import Text from "../atoms/Text";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Label from "../atoms/Label";

import FormField from "../molecules/FormField.jsx";

export default function ProductForm({
  data,
  setData,
  errors,
  readonly,
  submit,
  message,
}) {
  return (
    <form noValidate onSubmit={submit}>
      <fieldset disabled={readonly}>
        <div className="row g-3">
          {[
            ["codigo", "Código", {}],
            ["nombre", "Nombre", { maxLength: 100 }],
            ["precio", "Precio CLP", { type: "number", min: 0 }],
            ["stock", "Stock", { type: "number", min: 0 }],
            ["stockCritico", "Stock crítico", { type: "number", min: 0 }],
          ].map(([name, label, props]) => (
            <div className="col-md-6" key={name}>
              <FormField
                name={name}
                label={label}
                value={data[name]}
                onChange={(e) => setData({ ...data, [name]: e.target.value })}
                error={errors[name]}
                {...props}
              />
            </div>
          ))}
        </div>
        <FormField
          name="descripcion"
          label="Descripción"
          as="textarea"
          rows={3}
          maxLength={500}
          value={data.descripcion}
          onChange={(e) => setData({ ...data, descripcion: e.target.value })}
          error={errors.descripcion}
        />
        <FormField
          name="categoria"
          label="Categoría"
          value={data.categoria}
          onChange={(e) => setData({ ...data, categoria: e.target.value })}
        >
          {[
            "Mochilas",
            "Camping",
            "Accesorios",
            "Vestuario",
            "Calzado",
            "Iluminación",
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </FormField>
        <FormField
          name="dificultad"
          label="Dificultad"
          value={data.dificultad}
          onChange={(e) => setData({ ...data, dificultad: e.target.value })}
        >
          <option value="facil">Fácil</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </FormField>
        <FormField
          name="imagen"
          label="Imagen del catálogo"
          value={data.imagen}
          onChange={(e) => setData({ ...data, imagen: e.target.value })}
        >
          {[
            "mochila",
            "carpa",
            "bastones",
            "chaqueta",
            "botas",
            "saco-dormir",
            "linterna",
          ].map((img) => (
            <option value={`/img/${img}.png`} key={img}>
              {img}
            </option>
          ))}
        </FormField>
        <Label className="form-check mb-3">
          <Input
            className="form-check-input"
            type="checkbox"
            checked={data.destacado}
            onChange={(e) => setData({ ...data, destacado: e.target.checked })}
          />
          Destacar en inicio
        </Label>
        {!readonly && (
          <Button type="submit" className="btn btn-warning">
            Guardar producto
          </Button>
        )}
      </fieldset>
      <Text role="alert">{message}</Text>
    </form>
  );
}
