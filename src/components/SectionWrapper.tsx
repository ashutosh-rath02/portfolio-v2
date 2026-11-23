import React from "react";

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-2 md:px-8">
      {children}
    </div>
  );
};

export default SectionWrapper;
