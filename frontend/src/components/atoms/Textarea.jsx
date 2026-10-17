export default function Textarea({ className = "form-control", ...props }) {
  return <textarea className={className} {...props} />;
}
