import { HoverEffect } from "./card-hover-effect";
import { icons } from "../../config/content/icons";

export function TechStack() {
  return (
    <div className="flex flex-col items-start">
      <span className="heading mt-4 md:mt-32 underline">My Tech Stack🧑‍💻</span>
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
