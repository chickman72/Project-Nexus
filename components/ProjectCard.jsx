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
    <div className="group flex h-full flex-col justify-between rounded-md border border-[color:var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--uab-green)] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--uab-dark-green)]">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{project.description}</p>
        </div>
        <span className="rounded-md bg-[color:var(--uab-green-soft)] p-3 text-[color:var(--uab-green)]">
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-[color:var(--uab-green)]">
        {visibleUrls.map((entry, index) => (
          <a
            key={`${project.id}-${entry.url}`}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="nexus-button inline-flex items-center gap-2 rounded-md border border-transparent bg-[color:var(--uab-green-soft)] px-4 py-2 transition hover:border-[color:var(--uab-green)] hover:bg-white"
            aria-label={
              visibleUrls.length > 1
                ? `${entry.label ?? "Open Workspace"} ${index + 1}`
                : entry.label ?? "Open Workspace"
            }
          >
            {entry.label ?? "Open Workspace"}
            {visibleUrls.length > 1 ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[color:var(--text-secondary)]">
                {index + 1}
              </span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}
