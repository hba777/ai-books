import React from "react";

interface LandingCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

const LandingCard: React.FC<LandingCardProps> = ({ title, description, icon, className }) => (
  <div className={`bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition hover:shadow-xl ${className || ''}`}>
    {icon && <div className="mb-4 text-4xl text-blue-500">{icon}</div>}
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-500 text-base">{description}</p>
  </div>
);

export default LandingCard; 