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
    role: "Software Engineer",
    company: "TheAware.AI",
    period: "Jan 2024 - Present",
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
