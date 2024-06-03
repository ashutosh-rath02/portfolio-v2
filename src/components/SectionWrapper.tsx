import React from "react";

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="container mx-auto px-2 py-2 md:py-4 max-w-6xl md:px-8 flex flex-col items-start justify-center gap-24">
      {children}
    </section>
  );
};

export default SectionWrapper;
