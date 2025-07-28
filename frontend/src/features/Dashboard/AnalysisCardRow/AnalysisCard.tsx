import React from "react";

interface AnalysisCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ value, label, icon }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow p-8 min-w-[610px] max-w-[620px] w-full h-38">
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 mt-1">{label}</span>
      </div>
      <div className="w-12 h-12 flex items-center justify-center rounded-lg from-[#C522A7] to-[#A31680] bg-gradient-to-br">
        {icon}
      </div>
    </div>
  );
};

export default AnalysisCard;
