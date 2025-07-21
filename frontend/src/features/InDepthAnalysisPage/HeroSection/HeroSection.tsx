import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="flex items-center justify-between w-full mb-6 ml-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          In-Depth Analysis / Review
        </h1>
        <p className="text-gray-500 text-base">
          Here&rsquo;s the data of and analytics of books or documents.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
