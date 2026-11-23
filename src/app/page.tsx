import ContactButton from "@/components/contact";
import ExperienceSection from "@/components/Experience";
import HeroSection from "@/components/Hero";
import Projects from "@/components/ProjectCard";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <main className="flex w-full flex-col">
      <HeroSection />
      <Projects />
      <ExperienceSection />
      <TechStack />
      <ContactButton />
    </main>
  );
}
