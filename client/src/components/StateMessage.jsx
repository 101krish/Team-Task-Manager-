export default function StateMessage({ title, message, tone = "default" }) {
  const toneClasses = tone === "error" ? "border-error-container bg-error-container/20 text-on-error-container" : "border-outline-variant bg-white text-on-surface";

  return (
    <div className={`rounded-xl border p-lg ${toneClasses}`}>
      <h3 className="font-h3 text-h3">{title}</h3>
      {message ? <p className="mt-sm text-body-md text-on-surface-variant">{message}</p> : null}
    </div>
  );
}
