"use client";

import NumberTicker from "@/components/number-ticker";

const HeroNumbers = () => {
  const stats = [
    { value: 20, description: "Projects" },
    { value: 700, description: "Commits" },
    { value: 10, description: "Clients" },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-8 mt-2 md:mt-4">
      {stats.map((stat, index) => (
        <NumberTicker
          key={index}
          value={stat.value}
          description={stat.description}
          className="text-4xl md:text-6xl"
        />
      ))}
    </div>
  );
};

export default HeroNumbers;
