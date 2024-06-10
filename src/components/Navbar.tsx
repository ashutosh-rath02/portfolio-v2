import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-center text-white py-2 max-w-full mx-auto w-full gap-8 md:gap-24 backdrop-filter backdrop-blur-lg bg-opacity-10 z-10">
      <Link href="/" className="w-1/3">
        <p className="text-base md:text-xl font-bold">AR</p>
      </Link>
      <div className="flex items-center justify-center flex-grow w-1/3">
        <div className="flex items-center justify-between bg-gray-800 text-white px-8 py-2 rounded-3xl gap-8 md:gap-24 backdrop-filter backdrop-blur-lg bg-opacity-10 border border-gray-200 border-opacity-25 shadow-2xl">
          <ul className="flex space-x-4">
            <li>
              <Link href="/">
                <p className="hover:text-gray-400">Home</p>
              </Link>
            </li>
            <li>
              <Link href="/blogs">
                <p className="hover:text-gray-400">Blogs</p>
              </Link>
            </li>
            <li>
              <Link href="/projects">
                <p className="hover:text-gray-400">Projects</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-1/3" />
    </nav>
  );
};

export default Navbar;
