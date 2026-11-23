/* eslint-disable @next/next/no-img-element */
import type { Project } from "../../content/projects";

const linkClass =
  "text-sm font-medium text-foreground underline-offset-4 hover:underline";

export default function ProjectItem({ project }: { project: Project }) {
  return (
    <article className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-foreground/30">
      {project.img && (
        <img
          src={project.img}
          alt=""
          loading="lazy"
          className="mb-4 h-40 w-full rounded-lg object-cover"
        />
      )}
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {project.category}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{project.title}</h3>
      <p className="mt-2 flex-grow text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <li
            key={t}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
      {(project.url || project.github) && (
        <div className="mt-4 flex gap-4">
          {project.url && (
            <a
              className={linkClass}
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              Live ↗
            </a>
          )}
          {project.github && (
            <a
              className={linkClass}
              href={project.github}
              target="_blank"
              rel="noreferrer"
            >
              Code ↗
            </a>
          )}
        </div>
      )}
    </article>
  );
}
