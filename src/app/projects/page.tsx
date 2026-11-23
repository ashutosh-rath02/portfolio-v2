"use client";
import React, { useState } from "react";
import { projectsData } from "../../../content/projects";
import ProjectItem from "@/components/ProjectItem";

function AllProjects() {
  const [selected, setSelected] = useState<string | null>(null);

  // Only offer filters for tech used by more than one project
  const counts = new Map<string, number>();
  projectsData.forEach((p) =>
    p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1))
  );
  const filters = Array.from(counts.entries())
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);

  const visible = selected
    ? projectsData.filter((p) => p.tech.includes(selected))
    : projectsData;

  return (
    <div className="mt-12 w-full">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Projects
      </h1>
      <p className="mt-2 text-muted-foreground">
        {projectsData.length} projects, newest work first.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[null, ...filters].map((tech) => (
          <button
            key={tech ?? "all"}
            onClick={() => setSelected(tech)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              selected === tech
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tech ?? "All"}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((project) => (
          <ProjectItem key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}

export default AllProjects;
