import Link from "next/link";
import React from "react";
import { projectsData } from "../../config/content/projects";

function Projects() {
  const topProjects = projectsData.slice(0, 4);

  const FeaturedProjects = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-14 my-4">
      {topProjects.map((project, index) => (
        <div
          key={index}
          className="shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 relative overflow-hidden flex flex-col justify-between"
        >
          <figure className="relative">
            <img
              src={project.img}
              alt="Project"
              className="h-[200px] w-full object-cover rounded-t-xl"
            />
          </figure>
          <div className="p-6 text-gray-900 dark:text-white flex flex-col flex-grow">
            <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 my-2 overflow-x-auto">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex justify-between mt-auto">
              <a
                className="font-semibold bg-blue-600 hover:bg-blue-700 text-white text-md px-4 py-2 rounded-lg transition-colors duration-300"
                href={project.url}
                target="__blank"
                rel="noreferrer"
              >
                Visit
              </a>
              {project.github && (
                <a
                  className="font-semibold bg-gray-600 hover:bg-gray-700 text-white text-md px-4 py-2 rounded-lg transition-colors duration-300"
                  href={project.github}
                  target="__blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col mt-12">
      <p className="text-2xl md:text-3xl font-bold text-start mb-2 text-gray-900 dark:text-white">
        Featured Projects💪
      </p>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 w-16 mb-4"></div>
      <FeaturedProjects />
      <div className="mt-6 flex justify-center">
        <Link
          href="/projects"
          className="font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-md px-6 py-3 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg"
        >
          View All Projects
        </Link>
      </div>
    </div>
  );
}

export default Projects;
