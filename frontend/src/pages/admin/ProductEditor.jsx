import PageTemplate from "../../components/templates/PageTemplate";
import AppLink from "../../components/atoms/AppLink";
import Heading from "../../components/atoms/Heading";
import ProductForm from "../../components/organisms/ProductForm.jsx";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";

import { NotFound } from "../NotFound.jsx";
export function ProductEditor() {
  const { id } = useParams();
  const { products, saveProducts, session } = useStore();
  const navigate = useNavigate();
  const original = products.find((p) => String(p.id) === id);
  const readonly = session.rol !== "Administrador";
  const [data, setData] = useState(
    original || {
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      stockCritico: "",
      categoria: "Accesorios",
      dificultad: "facil",
      imagen: "/img/mochila.png",
      destacado: false,
    },
  );
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  if (id && !original) return <NotFound />;
  if (!id && readonly) return <Navigate to="/admin/productos" replace />;
  function submit(e) {
    e.preventDefault();
    if (readonly) return;
    const invalid = {};
    if (
      data.codigo.trim().length < 3 ||
      products.some(
        (p) =>
          p.id !== original?.id &&
          p.codigo.toLowerCase() === data.codigo.trim().toLowerCase(),
      )
    )
      invalid.codigo = "Usa un código único de al menos 3 caracteres.";
    if (!data.nombre.trim() || data.nombre.length > 100)
      invalid.nombre = "Ingresa un nombre de hasta 100 caracteres.";
    if (data.descripcion.length > 500)
      invalid.descripcion = "Máximo 500 caracteres.";
    for (const field of ["precio", "stock", "stockCritico"])
      if (
        String(data[field]).trim() === "" ||
        !Number.isSafeInteger(Number(data[field])) ||
        Number(data[field]) < 0
      )
        invalid[field] = "Ingresa un número entero igual o mayor que cero.";
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    const next = {
      ...data,
      id: original?.id || Math.max(0, ...products.map((p) => Number(p.id))) + 1,
      codigo: data.codigo.trim(),
      nombre: data.nombre.trim(),
      precio: Number(data.precio),
      stock: Number(data.stock),
      stockCritico: Number(data.stockCritico),
    };
    try {
      saveProducts([...products.filter((p) => p.id !== original?.id), next]);
      navigate("/admin/productos");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <PageTemplate className="">
      <Heading as="h1">
        {readonly
          ? "Detalle de producto"
          : original
            ? "Editar producto"
            : "Nuevo producto"}
      </Heading>
      <div className="form-panel">
        <ProductForm
          data={data}
          setData={setData}
          errors={errors}
          readonly={readonly}
          submit={submit}
          message={message}
        />
        <AppLink
          to="/admin/productos"
          className="text-link d-inline-block mt-3"
        >
          ← Volver al listado
        </AppLink>
      </div>
    </PageTemplate>
  );
}
