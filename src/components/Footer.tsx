"use client";
import { useState } from "react";
import {
  IconMail,
  IconBrandGithubFilled,
  IconBrandX,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import Link from "next/link";

const Footer = () => {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  return (
    <footer className="text-[#7E8C9A] mt-12 w-full backdrop-blur-md bg-opacity-30 bg-gray-900 rounded-lg mx-auto px-2 py-2 md:py-4 min-h-52 md:px-8">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center max-w-5xl px-4">
        <div className="mb-6 md:mb-0 md:w-3/4">
          <p className="text-2xl mb-4 font-bold ">
            Let&apos;s connect and grab a coffee ☕
          </p>
          <p className="font-bold">
            Drop me a line for work inquiries or just say hello
          </p>
          <div className="flex items-center mt-2">
            <IconMail className="h-6 w-6 mr-2 " />
            <span
              className="mr-2 cursor-pointer hover:underline"
              onClick={() => copyToClipboard("ashutosh123rath@gmail.com")}
            >
              ashutosh123rath@gmail.com
            </span>
            {emailCopied && <span className="text-green-500">Copied!</span>}
          </div>
          <p className="mt-4 ">
            Developed with <span className="text-red-500">❤️‍🩹</span> and a
            passionate
            <span className="text-gray-400"> 💻</span> by Ashutosh Rath
          </p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col gap-8 items-center md:items-end">
          <div className="mb-4 md:mb-0 items-start md:items-end text-right hidden md:block">
            <Link href={"/"}>
              <p className="font-semibold cursor-pointer hover:text-white">
                About
              </p>
            </Link>
            <Link href={"/projects"}>
              <p className="font-semibold cursor-pointer hover:text-white">
                Projects
              </p>
            </Link>
            <Link href={"/blogs"}>
              <p className="font-semibold cursor-pointer hover:text-white">
                Blogs
              </p>
            </Link>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://github.com/ashutosh-rath02"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithubFilled className="h-6 w-6 hover:text-white" />
            </a>
            <a
              href="https://twitter.com/v_ashu_dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandX className="h-6 w-6 hover:text-white" />
            </a>
            <a
              href="https://linkedin.com/in/rathashutosh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandLinkedin className="h-6 w-6 hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
