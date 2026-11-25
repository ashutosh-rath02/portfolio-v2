import SectionHeading from "./SectionHeading";

const ExperienceSection = () => {
  return (
    <section className="mt-24 w-full">
      <SectionHeading title="Experience" />
      <ol className="space-y-8 border-l pl-6">
        {experiences.map((exp) => (
          <li key={exp.company} className="relative">
            <span className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-foreground" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="font-semibold">
                {exp.role} <span className="text-muted-foreground">at</span>{" "}
                {exp.company}
              </h3>
              <p className="text-sm text-muted-foreground">{exp.period}</p>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {exp.descriptionPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {exp.skills.join(" · ")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

const experiences = [
  {
    role: "Software Developer",
    company: "AI-native engineering platform startup",
    period: "Sep 2026 - Present",
    location: "India",
    descriptionPoints: [
      "Build agentic developer tooling: an orchestration layer that runs coding agents in isolated lanes per work item, with live monitoring and steering.",
      "Built a model-based systems engineering toolchain (SysML v2 compiler, CLI and CI gates) that generates code and configuration from a single model and traces test evidence back to requirement IDs.",
      "Designed an evaluation and qualification framework for AI-enabled systems.",
      "Trained and evaluated a small calibrated model that returns typed judgments instead of free-form text, and built a distributed compute harness for ML workloads.",
      "Set up an AI agent that designs and reviews hardware (PCB) projects, and prototyped computer vision for retail checkout.",
      "Built robotics software for an autonomous ground vehicle: an Android app with ARCore localization, mapping and a microcontroller control link.",
    ],
    skills: [
      "LLM Agents",
      "Python",
      "SysML v2",
      "C++",
      "TypeScript",
      "Evals",
      "Computer Vision",
      "CI/CD",
    ],
  },
  {
    role: "Software Engineer",
    company: "TheAware.AI",
    period: "Jan 2024 - Jun 2026",
    location: "Durgapur, West Bengal, India",
    descriptionPoints: [
      "Developing AI-driven applications and products.",
      "Building cross-platform mobile applications using Flutter.",
      "Creating robust backends with Python for seamless application performance.",
      "Designing and implementing web applications using Next.js and Tailwind CSS.",
    ],
    skills: ["Flutter", "Python", "Next.js", "Tailwind CSS", "AI Applications"],
  },
  {
    role: "Full Stack Developer",
    company: "Anatech Global Consultancy",
    period: "May 17, 2024 - July 31, 2024",
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
    period: "Dec 2023 - Mar 2024",
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
    period: "Oct 2023 - Dec 2023",
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
