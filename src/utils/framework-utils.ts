export const frameworks = [
  "react",
  "next",
  "mongodb",
  "tailwind",
  "supabase",
  "typescript",
  "linux",
  "chrome",
  "node",
  "desktop",
  "mobile",
  "docker",
] as const;

export type Framework = (typeof frameworks)[number];
//docker, supabase, linux, node
