export default function ProgressCard({ label, value, detail }) {
  return (
    <article className="progressCard">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}
