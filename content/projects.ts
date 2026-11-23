export type Project = {
  title: string;
  description: string;
  tech: string[];
  /** Live site, docs, or package page */
  url?: string;
  github?: string;
  /** Optional screenshot. New projects are text-first and don't need one. */
  img?: string;
  /** Shown on the home page and at the top of /projects */
  featured?: boolean;
  /** Short line shown above the title, e.g. "AI tooling" */
  category: string;
};

const cdn = "https://res.cloudinary.com/dhnkuonev/image/upload";

export const projectsData: Project[] = [
  // ---- Featured: recent open-source work ----
  {
    title: "agentprobe",
    category: "AI tooling",
    featured: true,
    description:
      "Deterministic record-and-replay test harness for AI agents. Record your agent's OpenAI or Anthropic calls once, then replay them in CI with no network, no cost and no flakiness. Published on PyPI as a pytest plugin.",
    url: "https://pypi.org/project/pytest-agentprobe/",
    github: "https://github.com/ashutosh-rath02/agentprobe",
    tech: ["Python", "pytest", "OpenAI", "Anthropic"],
  },
  {
    title: "LoopLens",
    category: "AI tooling",
    featured: true,
    description:
      "Chrome DevTools for AI agent loops. A local-first, real-time debugger that shows an agent's execution live and warns when it repeats itself, burns tokens, retries blindly or stops making progress.",
    url: "https://ashutosh-rath02.github.io/looplens/",
    github: "https://github.com/ashutosh-rath02/looplens",
    tech: ["TypeScript", "Observability", "LLM Agents"],
  },
  {
    title: "Schemantic",
    category: "Multi-agent system",
    featured: true,
    description:
      "Turns a circuit board's schematic PDF into a live connectivity graph, AI-identified parts with page-cited datasheet facts, and a grounded chat agent that reasons over the verified graph.",
    url: "https://schemantic.ashutoshrath.me/",
    github: "https://github.com/ashutosh-rath02/schemantic",
    tech: ["Python", "Multi-agent", "RAG", "Hardware"],
  },
  {
    title: "Software Factory",
    category: "Developer tools",
    featured: true,
    description:
      "A local tool you point at a repository. It reads requirements and tickets, gives each piece of work an isolated lane, runs an agent in it, and lets you watch and steer the agent while it works.",
    github: "https://github.com/ashutosh-rath02/software-factory",
    tech: ["C++17", "React", "TypeScript", "Vite"],
  },
  {
    title: "PXR",
    category: "Embedded systems",
    featured: true,
    description:
      "Deterministic action admission for embedded systems. Checks actuator commands against authority, timing, parameter limits and device state before a driver runs, and triggers a local fallback when a lease expires.",
    url: "https://ashutosh-rath02.github.io/pxr/",
    github: "https://github.com/ashutosh-rath02/pxr",
    tech: ["Rust", "no_std", "C/C++ FFI"],
  },
  {
    title: "Chronicle",
    category: "AI memory",
    featured: true,
    description:
      "A deterministic bitemporal resolution engine for AI agent memory. Facts live in time-scoped supersession chains and freshness is resolved with plain SQL and Python, with no LLM judging what is current.",
    github: "https://github.com/ashutosh-rath02/chronicle",
    tech: ["Python", "SQL", "Agent memory"],
  },

  // ---- Research and systems ----
  {
    title: "TileCDC",
    category: "Systems",
    description:
      "Content-defined chunking on CPU matrix units. 2.2 to 2.6 times faster than FastCDC on one core with deduplication ratio within 1%, using Intel AMX with an AVX-512 path.",
    github: "https://github.com/ashutosh-rath02/tilecdc",
    tech: ["C", "Python", "Intel AMX", "AVX-512"],
  },
  {
    title: "DYLAN",
    category: "Research implementation",
    description:
      "A readable, tested Python implementation of DYLAN, dynamic graph indexing for label-filtered approximate nearest neighbour search (SIGMOD 2026). Supports online inserts without a rebuild.",
    github: "https://github.com/ashutosh-rath02/dylan",
    tech: ["Python", "Vector search", "ANNS"],
  },
  {
    title: "Dissonance",
    category: "AI research",
    description:
      "Reads AI research papers, extracts factual claims and flags pairs of claims from different papers that actually disagree. Over 1,500 adjudicated conflicts, each re-verified against its source.",
    github: "https://github.com/ashutosh-rath02/dissonance",
    tech: ["Python", "LLMs", "Claim extraction"],
  },
  {
    title: "indic-quant",
    category: "Research",
    description:
      "A pilot study of how much llama.cpp quantization hurts a small multilingual model in Indic languages, and whether an Indic-calibrated importance matrix recovers the loss at the same file size.",
    github: "https://github.com/ashutosh-rath02/indic-quant",
    tech: ["Python", "llama.cpp", "Quantization", "Evals"],
  },
  {
    title: "sys1",
    category: "ML",
    description:
      "A small, open, self-hosted \"System One\" model that returns fast typed judgments (Choice, Score) with calibrated probabilities instead of generated text. Built in public, including what did not work.",
    github: "https://github.com/ashutosh-rath02/sys1",
    tech: ["Python", "Encoders", "Calibration"],
  },

  // ---- Apps and tools ----
  {
    title: "whatsapp-agent",
    category: "AI agent",
    description:
      "Save a link or note to your WhatsApp \"Message Yourself\" chat and an agent researches it on the web, then replies in the same chat with a short, cited briefing.",
    github: "https://github.com/ashutosh-rath02/whatsapp-agent",
    tech: ["Python", "Agents", "Web research"],
  },
  {
    title: "clipsearch",
    category: "AI app",
    description:
      "Ctrl-F for video. A local, private, multimodal search engine that finds what was said or shown in a video using Gemma, then jumps to the timestamp. Nothing leaves your machine.",
    github: "https://github.com/ashutosh-rath02/gemma-yt-rag",
    tech: ["Python", "Gemma", "Multimodal", "Local-first"],
  },
  {
    title: "LinguaLoop",
    category: "AI backend",
    description:
      "A production-style AI language tutor backend covering RAG, agents, memory, guardrails, evals, real-time voice, observability and failure handling.",
    github: "https://github.com/ashutosh-rath02/lingualoop",
    tech: ["Python", "RAG", "Redis", "Postgres", "Pinecone"],
  },
  {
    title: "Atrophy",
    category: "CLI",
    description:
      "Are you getting worse at coding without AI? A command-line app that hands you small exercises to solve unaided, grades them, and charts a skill rating over the weeks.",
    github: "https://github.com/ashutosh-rath02/atrophy",
    tech: ["Python", "CLI"],
  },
  {
    title: "Phantom Range",
    category: "Browser game",
    description:
      "A webcam AR shooting range. Make a finger gun at your camera and a weapon appears in your hand with recoil, brass and spatial sound. Runs entirely in the browser.",
    url: "https://phantom-range.vercel.app",
    github: "https://github.com/ashutosh-rath02/phantom-range",
    tech: ["three.js", "MediaPipe", "JavaScript"],
  },
  {
    title: "Git-re",
    category: "Web app",
    description:
      "Generates a professional resume from a GitHub profile. Enter a username and it builds a resume from that user's contributions and projects.",
    img: `${cdn}/v1717770732/portfolio/Screenshot_2024-06-07_200139_v4resd.png`,
    url: "https://git-re.vercel.app/",
    github: "https://github.com/ashutosh-rath02/git-re",
    tech: ["Next.js", "Tailwind", "Supabase", "Redis"],
  },

  // ---- Earlier work ----
  {
    title: "HackNITR 5.0",
    category: "Event website",
    description:
      "Website for one of India's largest student-run hackathons, with 3000+ registrations worldwide. Led a team of 5 to build and manage it.",
    img: `${cdn}/v1717771080/portfolio/hacknitr-5_dkqznq_lcpcqv.jpg`,
    url: "https://hacknitr.com/",
    github: "https://github.com/ashutosh-rath02/project-oregano",
    tech: ["React", "Tailwind"],
  },
  {
    title: "Innovision",
    category: "Event website",
    description:
      "Website for the largest tech fest in NIT Rourkela and Eastern India, with over 1 million hits and 1000+ student registrations.",
    img: `${cdn}/v1717771888/portfolio/inno_qlrbb0_wkqeoq.jpg`,
    github: "https://github.com/dscnitrourkela/project-raisin",
    tech: ["React", "Node", "MongoDB", "Express"],
  },
  {
    title: "Event Ticket Generator",
    category: "Web app",
    description:
      "An event invite and ticket generator for the HackNITR community. Led and developed the project.",
    img: `${cdn}/v1717772585/portfolio/Screenshot_2024-06-07_203222_jtpttg.png`,
    url: "https://project-ticket.vercel.app",
    github: "https://github.com/dscnitrourkela/project-ticket",
    tech: ["Next.js", "Firebase", "Tailwind"],
  },
  {
    title: "BruinBuzz",
    category: "Web app",
    description:
      "A full event-management website built in two days, with user authentication, event creation and registration.",
    img: `${cdn}/v1717773055/portfolio/Screenshot_2024-06-07_201913_cvsupf.png`,
    url: "https://bruinbuzz.com",
    tech: ["React", "Node", "MongoDB", "Express", "Tailwind"],
  },
  {
    title: "Screenflick",
    category: "AI app",
    description:
      "Generates iconic movie quotes from films around the world using Gemini, with character names and English translations.",
    img: `${cdn}/v1721569736/portfolio/Screenshot_2024-07-21_191721_vfvcrk.png`,
    url: "https://screenflick.ashutoshrath.me/",
    github: "https://github.com/ashutosh-rath02/dialogue-ai",
    tech: ["Next.js", "Tailwind", "Gemini"],
  },
  {
    title: "Cosmic Type",
    category: "Browser game",
    description:
      "A typing game where you defend Earth from alien invaders by typing words quickly and accurately.",
    img: `${cdn}/v1729072656/Screenshot_2024-10-16_152643_pocxrp.png`,
    url: "https://cosmictype.ashutoshrath.me/",
    github: "https://github.com/ashutosh-rath02/space-type",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Poke-tek",
    category: "Web app",
    description:
      "Explore Pokemon, create fusions and predict battle outcomes. Built with React and the PokeAPI.",
    img: `${cdn}/v1729451009/Screenshot_2024-10-21_002929_bzc0kb.png`,
    url: "https://poke-tek.vercel.app/",
    github: "https://github.com/ashutosh-rath02/poke-tek",
    tech: ["React", "Tailwind", "API"],
  },
  {
    title: "Pterabyte",
    category: "Chrome extension",
    description:
      "A Chrome extension to store all of your important links in one place.",
    img: `${cdn}/v1721828584/portfolio/Screenshot_2024-07-04_201229_ctx4dh.png`,
    github: "https://github.com/ashutosh-rath02/pterabyte",
    tech: ["JavaScript"],
  },
  {
    title: "Travel Tales",
    category: "Web app",
    description:
      "A travel stories site with visually rich cards showing the title, image, traveler, date and tags for each post.",
    img: `${cdn}/v1717773417/portfolio/Screenshot_2024-06-07_204533_rwjapx.png`,
    url: "https://traveltaless.vercel.app/",
    github: "https://github.com/ashutosh-rath02/travel-tales-frontend",
    tech: ["React", "Node", "MongoDB", "Express", "Tailwind"],
  },
];
