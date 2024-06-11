import { HoverEffect } from "./card-hover-effect";
import { icons } from "../../content/icons";

export function TechStack() {
  return (
    <div className="flex flex-col items-center md:items-start">
      <span className="heading">My Tech Stack🧑‍💻</span>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 w-16 mb-4"></div>

      <HoverEffect
        items={icons.map((icon) => ({
          title: icon.name,
          link: "#",
          icon: icon.svg,
          color: icon.color,
        }))}
      />
    </div>
  );
}
