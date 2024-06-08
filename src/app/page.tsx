import ExperienceSection from "@/components/Experience";
import HeroSection from "@/components/Hero";
import Projects from "@/components/ProjectCard";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <HeroSection />
      <ExperienceSection />
      <TechStack />
      <Projects />
    </main>
  );
}
