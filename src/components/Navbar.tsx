import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "https://blogs.ashutoshrath.me/", label: "Blog" },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-20 -mx-4 flex w-[calc(100%+2rem)] items-center justify-between border-b border-transparent bg-background/80 px-4 py-3 backdrop-blur md:-mx-8 md:w-[calc(100%+4rem)] md:px-8">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        AR
      </Link>
      <ul className="flex items-center gap-6 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-brand">
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          {/* Static pages served from public/notes, so use a plain anchor */}
          <a href="/notes" className="transition-colors hover:text-brand">
            Notes
          </a>
        </li>
        <li>
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
