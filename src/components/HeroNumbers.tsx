"use client";

import NumberTicker from "@/components/number-ticker";

const HeroNumbers = () => {
  const stats = [
    { value: 20, description: "Projects" },
    { value: 700, description: "Commits" },
    { value: 10, description: "Clients" },
  ];

  return (
    <div className="w-full flex flex-row justify-around items-center md:space-x-8 mt-2 md:mt-12">
      {stats.map((stat, index) => (
        <NumberTicker
          key={index}
          value={stat.value}
          description={stat.description}
          className="text-3xl md:text-5xl"
        />
      ))}
    </div>
  );
};

export default HeroNumbers;
