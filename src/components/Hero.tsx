import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="mt-16 md:mt-24 flex w-full flex-col-reverse items-start gap-8 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <p className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Available for work
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Hi, I&apos;m Ashutosh Rath.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          AI engineer from NIT Rourkela. I build LLM agents and the tooling
          around them: debuggers, test harnesses, agent memory, retrieval and
          evals, plus agentic tools for hardware design and robotics.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/resume"
            target="_blank"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Resume
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          >
            Projects
          </Link>
          <a
            href="https://github.com/ashutosh-rath02"
            target="_blank"
            rel="noreferrer"
            className="px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub ↗
          </a>
        </div>
      </div>
      <Image
        alt="Ashutosh Rath"
        src="https://res.cloudinary.com/dhnkuonev/image/upload/v1718546215/portfolio/unnamed_wxefuz.jpg"
        width={160}
        height={160}
        className="h-32 w-32 rounded-full border object-cover md:h-40 md:w-40"
        priority
      />
    </section>
  );
}
