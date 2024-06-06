import HeroSection from "@/components/Hero";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <HeroSection />
      <p className="text-2xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-5xl mt-4 md:mt-32 underline">
        My Tech Stack
      </p>
      <TechStack />
    </main>
  );
}
