import { getProjects } from "../lib/content";
import ProjectCard from "../components/ProjectCard";
import Script from "next/script";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen px-6 pb-20 pt-12 sm:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              School of Nursing
            </p>
            <h1 className="font-display text-4xl font-semibold text-[color:var(--nexus-blue)] sm:text-5xl">
              Project Nexus
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              A centralized launchpad for clinical education, research support,
              and compliance tooling.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <nexus-chat-widget />
      <Script src="/embed.js" strategy="afterInteractive" />

    </main>
  );
}
