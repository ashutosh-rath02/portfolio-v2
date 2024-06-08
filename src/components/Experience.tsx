"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { IconBriefcase } from "@tabler/icons-react";

const ExperienceSection = () => {
  const [selectedCompany, setSelectedCompany] = useState(experiences[0]);

  return (
    <section className="mt-24 mx-auto min-h-96">
      <span className="heading">Work Experience🥼</span>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 w-16 mb-4"></div>
      <div className="flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg gap-12">
        <div className="flex-shrink-0 w-full md:w-1/3">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 cursor-pointer transition-transform duration-300 ${
                selectedCompany === exp
                  ? "bg-gray-200 text-black dark:bg-gray-800 dark:text-gray-300"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800 text-black dark:text-gray-300"
              } border-b border-gray-300 dark:border-gray-600 mb-4 md:mb-0`}
              onClick={() => setSelectedCompany(exp)}
            >
              <div className="flex items-center space-x-4">
                <IconBriefcase className="h-6 w-6" />
                <div>
                  <h3 className="text-md font-semibold">{exp.company}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex-grow mt-4 md:mt-0 md:ml-8 p-6 shadow-lg rounded-lg border border-gray-300 dark:border-gray-600">
          <div className="flex items-center space-x-4 mb-4">
            <IconBriefcase className="h-10 w-10 text-blue-500" />
            <div>
              <h3 className="text-2xl font-semibold">{selectedCompany.role}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Period:</strong> {selectedCompany.period}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Location:</strong> {selectedCompany.location}
              </p>
            </div>
          </div>
          <div
            className="text-sm text-gray-700 dark:text-gray-400"
            style={{ maxHeight: "20rem", overflowY: "auto" }}
          >
            <strong>Description:</strong>
            <ul className="list-disc pl-4 mt-2">
              {selectedCompany.descriptionPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-400 mt-4">
            <strong>Skills:</strong>{" "}
            {selectedCompany.skills.map((skill, index) => (
              <span key={index}>
                {index > 0 ? ", " : ""}
                <strong>{skill}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const experiences = [
  {
    role: "Full Stack Developer",
    company: "Anatech Global Consultancy",
    period: "May 17, 2024 - Present",
    location: "Remote",
    descriptionPoints: [
      "Leading various projects, leveraging full-stack development skills.",
      "Developing and maintaining web applications using modern technology stacks.",
      "Ensuring optimal performance and user satisfaction through continuous improvement.",
    ],
    skills: [
      "Full Stack Development",
      "Web Applications",
      "Performance Optimization",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "LesGo",
    period: "Dec 2023 - Mar 2024 · 4 mos",
    location: "Bengaluru, Karnataka, India · Remote",
    descriptionPoints: [
      "Instrumental in developing LesGo's flagship product from inception to launch.",
      "Crafted visually captivating frontends with ReactJS.",
      "Established robust backend services using Node.js and AdonisJS.",
      "Designed and implemented multiple APIs to ensure seamless operations.",
    ],
    skills: [
      "Front-End Development",
      "Back-End Web Development",
      "API Design",
      "ReactJS",
      "Node.js",
    ],
  },
  {
    role: "Frontend Developer",
    company: "Stealth Mode AI Startup",
    period: "Oct 2023 - Dec 2023 · 3 mos",
    location: "Remote",
    descriptionPoints: [
      "Developed a robust admin panel and engaging customer interface.",
      "Implemented advanced react-routes and effective state management techniques.",
      "Ensured smooth navigation and interaction for optimal user experience.",
      "Solicited and integrated feedback for continuous refinement of features.",
    ],
    skills: [
      "ReactJS",
      "State Management",
      "User Experience",
      "Admin Panel Development",
    ],
  },
];

export default ExperienceSection;
