import {
  IconBrandGithubFilled,
  IconBrandLinkedin,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";

const social = [
  { href: "https://github.com/ashutosh-rath02", Icon: IconBrandGithubFilled, label: "GitHub" },
  { href: "https://linkedin.com/in/rathashutosh", Icon: IconBrandLinkedin, label: "LinkedIn" },
  { href: "https://twitter.com/v_ashu_dev", Icon: IconBrandX, label: "X" },
  { href: "mailto:ashutosh123rath@gmail.com", Icon: IconMail, label: "Email" },
];

const Footer = () => {
  return (
    <footer className="mx-auto mt-24 flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t px-4 py-8 text-sm text-muted-foreground sm:flex-row md:px-8">
      <p>© {new Date().getFullYear()} Ashutosh Rath</p>
      <div className="flex gap-4">
        {social.map(({ href, Icon, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
