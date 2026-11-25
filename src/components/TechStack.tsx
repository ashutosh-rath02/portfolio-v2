import { icons } from "../../content/icons";
import SectionHeading from "./SectionHeading";

const aiSkills = [
  "Python",
  "LLM agents",
  "Multi-agent systems",
  "RAG",
  "Evals",
  "Agent memory",
  "Vector search",
  "Quantization",
  "Computer vision",
  "Tool use",
];

function Tags({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((name) => (
        <li
          key={name}
          className={`rounded-full border px-3 py-1 text-sm ${
            accent
              ? "border-brand/40 text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

export function TechStack() {
  return (
    <section className="mt-24 w-full">
      <SectionHeading title="Skills" />
      <p className="mb-3 text-sm font-medium text-brand">AI and ML</p>
      <Tags items={aiSkills} accent />
      <p className="mb-3 mt-8 text-sm font-medium text-brand">
        Web and tooling
      </p>
      <Tags items={icons.map((i) => i.name)} />
    </section>
  );
}
