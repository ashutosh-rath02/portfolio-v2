import { HoverEffect } from "./card-hover-effect";
import { icons } from "../../config/content/icons";

export function TechStack() {
  return (
    <div className="mx-auto flex flex-col justify-center">
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
