import Link from "next/link";
import { projectsData } from "../../content/projects";
import ProjectItem from "./ProjectItem";
import SectionHeading from "./SectionHeading";

function Projects() {
  const featured = projectsData.filter((p) => p.featured);

  return (
    <section className="mt-24 w-full">
      <SectionHeading
        title="Selected projects"
        subtitle="Recent open-source work, mostly around AI agents, developer tooling and systems."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {featured.map((project) => (
          <ProjectItem key={project.title} project={project} />
        ))}
      </div>
      <div className="mt-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
}

export default Projects;
