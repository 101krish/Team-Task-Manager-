export default function StateMessage({ title, message, tone = "default" }) {
  const toneConfig = {
    default: {
      container: "border-outline-variant bg-surface-container-lowest text-on-surface",
      icon: "info",
      iconColor: "text-primary"
    },
    error: {
      container: "border-error-container bg-error-container/15 text-on-error-container",
      icon: "error",
      iconColor: "text-error"
    },
    success: {
      container: "border-green-300 bg-green-50 text-green-800",
      icon: "check_circle",
      iconColor: "text-green-600"
    },
    warning: {
      container: "border-yellow-300 bg-yellow-50 text-yellow-800",
      icon: "warning",
      iconColor: "text-yellow-600"
    }
  };

  const config = toneConfig[tone] || toneConfig.default;

  return (
    <div className={`rounded-xl border p-lg ${config.container}`}>
      <div className="flex items-start gap-md">
        <span className={`material-symbols-outlined text-xl flex-shrink-0 ${config.iconColor}`}>{config.icon}</span>
        <div>
          <h3 className="font-h3 text-h3">{title}</h3>
          {message ? <p className="mt-sm text-body-md">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
