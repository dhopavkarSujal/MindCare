import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export function Feedback({ kind = "info", children }: { kind?: "error" | "success" | "info"; children: React.ReactNode }) {
  const Icon = kind === "error" ? AlertCircle : kind === "success" ? CheckCircle2 : Info;
  return <div className={`mc-alert mc-alert--${kind}`} role={kind === "error" ? "alert" : "status"}><Icon size={16} aria-hidden="true" /><span>{children}</span></div>;
}

export function LoadingPanel({ label = "Loading your space…" }: { label?: string }) {
  return <div className="mc-loading-panel" role="status"><span className="mc-loading-ring" /><span>{label}</span></div>;
}

export function EmptyPanel({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mc-empty-panel"><span className="mc-empty-panel__icon">{icon}</span><h3>{title}</h3><p>{description}</p>{action && <div>{action}</div>}</div>;
}
