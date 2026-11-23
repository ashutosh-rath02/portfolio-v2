import React from "react";
import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "https://blogs.ashutoshrath.me/", label: "Blog" },
];

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        AR
      </Link>
      <ul className="flex items-center gap-6 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          {/* Static pages served from public/notes, so use a plain anchor */}
          <a href="/notes" className="hover:text-foreground">
            Notes
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
