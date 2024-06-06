import HeroSection from "@/components/Hero";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <HeroSection />
      <TechStack />
    </main>
  );
}
