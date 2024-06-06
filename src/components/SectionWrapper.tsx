import React from "react";

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="container mx-auto px-2 py-2 md:py-4 max-w-5xl md:px-8 flex flex-col items-center justify-center gap-2 md:gap-4">
      {children}
    </section>
  );
};

export default SectionWrapper;
