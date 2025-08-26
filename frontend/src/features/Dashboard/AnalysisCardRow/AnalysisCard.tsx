import React from "react";

interface AnalysisCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ value, label, icon }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8 w-full min-w-[280px] sm:min-w-[400px] lg:min-w-[500px] max-w-[690px] h-40 sm:h-36 lg:h-40">
      <div className="flex flex-col">
        <span className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-xs sm:text-sm lg:text-sm text-gray-500 mt-1">{label}</span>
      </div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 flex items-center justify-center rounded-lg from-[#C522A7] to-[#A31680] bg-gradient-to-br">
        {icon}
      </div>
    </div>
  );
};

export default AnalysisCard;
