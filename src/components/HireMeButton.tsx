import Link from "next/link";
import React from "react";

const HireMeButton = () => {
  return (
    <Link href="/resume" target="_blank">
      <button className="p-[2px] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
        <div className="px-4 py-2 bg-[#020817] rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
          Hire Me!
        </div>
      </button>
    </Link>
  );
};

export default HireMeButton;
