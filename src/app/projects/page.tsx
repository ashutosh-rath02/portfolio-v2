/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { projectsData } from "../../../content/projects";

type Project = {
  title: string;
  tag: string;
  description: string;
  img: string;
  url: string;
  github?: string;
  tech: string[];
};

function AllProjects() {
  const allTechStacks = Array.from(
    new Set(projectsData.flatMap((project) => project.tech))
  );

  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);

  const handleTechStackClick = (tech: string) => {
    setSelectedTechStacks((prev) =>
      prev.includes(tech)
        ? prev.filter((stack) => stack !== tech)
        : [...prev, tech]
    );
  };

  const filteredProjects =
    selectedTechStacks.length === 0
      ? projectsData
      : projectsData.filter((project) =>
          selectedTechStacks.every((tech) => project.tech.includes(tech))
        );

  return (
    <div className="container mx-auto mt-12">
      <div className="text-center mb-12">
        <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide">
          All My Projects
        </p>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic bg-gray-100 dark:bg-gray-700 px-4 py-2 inline-block rounded-lg shadow-md">
          "Yes, I really do code this much!"
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {allTechStacks.map((tech, index) => (
          <button
            key={index}
            onClick={() => handleTechStackClick(tech)}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedTechStacks.includes(tech)
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-14 my-4">
        {filteredProjects.map((project, index) => (
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
              <div className="flex flex-wrap gap-2 my-2 mb-4">
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
    </div>
  );
}

export default AllProjects;
