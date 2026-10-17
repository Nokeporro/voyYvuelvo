export default function Field({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  children,
  ...props
}) {
  const shared = {
    id: name,
    name,
    value,
    onChange,
    "aria-invalid": Boolean(error),
    "aria-describedby": `${name}-hint ${name}-error`,
    className: `form-control ${error ? "is-invalid" : ""}`,
    ...props,
  };
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      {children ? (
        <select
          {...shared}
          className={`form-select ${error ? "is-invalid" : ""}`}
        >
          {children}
        </select>
      ) : props.as === "textarea" ? (
        <textarea {...shared} as={undefined} />
      ) : (
        <input {...shared} />
      )}
      <small id={`${name}-hint`} className="form-text d-block">
        {hint}
      </small>
      <small
        id={`${name}-error`}
        className="invalid-feedback d-block"
        aria-live="polite"
      >
        {error}
      </small>
    </div>
  );
}
