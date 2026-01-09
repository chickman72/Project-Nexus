import { getIconComponent } from "../lib/icons";

export default function ProjectCard({ project }) {
  const Icon = getIconComponent(project.iconName);
  const urls = Array.isArray(project.urls)
    ? project.urls
    : project.url
      ? [project.url]
      : [];
  const normalizedUrls = urls
    .map((item) => {
      if (typeof item === "string") {
        return { url: item, label: undefined };
      }
      if (item && typeof item === "object") {
        return { url: item.url, label: item.label };
      }
      return null;
    })
    .filter((item) => item && item.url);
  const visibleUrls = normalizedUrls.slice(0, 5);

  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-card transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-[color:var(--nexus-blue)]">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{project.description}</p>
        </div>
        <span className="rounded-xl bg-[color:var(--nexus-ice)] p-3 text-[color:var(--nexus-blue)]">
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-[color:var(--nexus-blue-light)]">
        {visibleUrls.map((entry, index) => (
          <a
            key={`${project.id}-${entry.url}`}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[color:var(--nexus-ice)] px-4 py-2 transition hover:border-slate-200 hover:bg-white"
            aria-label={
              visibleUrls.length > 1
                ? `${entry.label ?? "Open Workspace"} ${index + 1}`
                : entry.label ?? "Open Workspace"
            }
          >
            {entry.label ?? "Open Workspace"}
            {visibleUrls.length > 1 ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                {index + 1}
              </span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}
