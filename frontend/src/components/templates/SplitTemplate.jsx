export default function SplitTemplate({
  intro,
  children,
  introClass = "col-lg-5",
  contentClass = "col-lg-7",
  className = "row g-5",
}) {
  return (
    <div className={className}>
      <div className={introClass}>{intro}</div>
      <section className={contentClass}>{children}</section>
    </div>
  );
}
