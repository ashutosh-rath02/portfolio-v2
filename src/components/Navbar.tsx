import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 text-white px-8 py-2 max-w-max mx-auto w-full rounded-3xl gap-8 md:gap-4 backdrop-filter backdrop-blur-lg bg-opacity-10 border border-gray-200 border-opacity-25 shadow-2xl z-10">
      <Link href="/">
        <p className="text-base md:text-xl font-bold">AR</p>
      </Link>
      <ul className="flex space-x-4">
        <li>
          <Link href="/">
            <p className="hover:text-gray-400">Home</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
