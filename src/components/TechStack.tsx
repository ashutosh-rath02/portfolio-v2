import { icons } from "../../content/icons";
import SectionHeading from "./SectionHeading";

export function TechStack() {
  return (
    <section className="mt-24 w-full">
      <SectionHeading title="Tech stack" />
      <ul className="flex flex-wrap gap-2">
        {icons.map((icon) => (
          <li
            key={icon.name}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground"
          >
            {icon.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
