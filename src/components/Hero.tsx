"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { assets } from "@/utils/asset-utils";
import { type Framework, frameworks } from "@/utils/framework-utils";
import { cn } from "@/utils/tailwind-utils";
import { FrameworkRotation } from "@/components/framework-rotation";
import { Poppins } from "next/font/google";
import HeroNumbers from "./HeroNumbers";

const poppins = Poppins({
  weight: "700",
  subsets: ["latin"],
});

export default function HeroSection() {
  const [currentFramework, setCurrentFramework] = useState<Framework>(
    frameworks[0]
  );
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const rotateFrameworks = () => {
      setCurrentFramework(frameworks[currentIndex]);
      currentIndex = (currentIndex + 1) % frameworks.length;
    };
    const intervalId = setInterval(rotateFrameworks, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setShowBackground(true);
  }, []);

  return (
    <main>
      {/* Background color */}
      <div
        className={cn(
          "fixed inset-0 transition-color delay-100 duration-700 opacity-25 -z-10",
          {
            "bg-purple-300": currentFramework === "next",
            "bg-sky-300": currentFramework === "typescript",
            "bg-yellow-300": currentFramework === "chrome",
            "bg-teal-300": currentFramework === "tailwind",
            "bg-blue-300": currentFramework === "react",
            "bg-green-600": currentFramework === "mongodb",
            "bg-orange-400": currentFramework === "linux",
            "bg-red-300": currentFramework === "mobile",
            "bg-neutral-300": currentFramework === "desktop",
            "bg-green-900": currentFramework === "node",
            "bg-lime-300": currentFramework === "supabase",
            "bg-blue-900": currentFramework === "docker",
          }
        )}
      />
      <div
        style={{
          backgroundSize: "50px",
          backgroundImage: `url(${assets.square})`,
        }}
        className="fixed inset-0 opacity-30 -z-10"
      />
      <Image
        width={1200}
        height={1200}
        role="presentation"
        alt="gradient background"
        className="fixed inset-0 w-screen h-screen object-cover -z-10"
        src={assets.gradient}
      />
      <div
        className={cn(
          "bg-black fixed inset-0 transition-opacity duration-1000 -z-10",
          !showBackground ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Content */}
      <div className="max-w-7xl mt-20 mx-auto px-4 sm:px-0">
        <div className="relative z-10">
          {/* Content */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Badge */}
            <div className="absolute top-0 md:top-12 left-6 mt-[-1.5rem] ml-[-1.5rem] flex items-center border-2 px-2 md:px-4 rounded-3xl py-0 md:py-2">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <p className="text-green-500 font-bold">Available for work</p>
            </div>
            {/* Text */}
            <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1
                className={`text-3xl md:text-5xl leading-snug mb-4 ${poppins.className}`}
              >
                Transforming Ideas into Reality
              </h1>
              <div className="text-xl md:text-3xl max-w-3xl mb-8 leading-loose md:leading-[3.5rem] font-semibold">
                Crafting elegant solutions with{" "}
                <FrameworkRotation currentFramework={currentFramework} /> and
                beyond.
              </div>
            </div>
            {/* Image */}
            <div className="w-full md:w-1/2 p-4 flex items-center justify-center">
              <Image
                alt="Portfolio"
                className={cn("rounded-lg border-4", {
                  "border-purple-300": currentFramework === "next",
                  "border-sky-300": currentFramework === "typescript",
                  "border-yellow-300": currentFramework === "chrome",
                  "border-teal-300": currentFramework === "tailwind",
                  "border-blue-300": currentFramework === "react",
                  "border-green-300": currentFramework === "mongodb",
                  "border-orange-400": currentFramework === "linux",
                  "border-red-300": currentFramework === "mobile",
                  "border-neutral-300": currentFramework === "desktop",
                  "border-green-900": currentFramework === "node",
                  "border-lime-300": currentFramework === "supabase",
                  "border-blue-900": currentFramework === "docker",
                })}
                src="https://res.cloudinary.com/dhnkuonev/image/upload/v1717425040/portfolio/Ashutosh_Rath_yh8rhv.jpg"
                width="400"
                height="400"
              />
            </div>
          </div>
        </div>
      </div>

      <HeroNumbers />
    </main>
  );
}
