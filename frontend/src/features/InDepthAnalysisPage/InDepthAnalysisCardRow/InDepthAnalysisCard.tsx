import React from 'react';

interface InDepthAnalysisCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
}

const InDepthAnalysisCard: React.FC<InDepthAnalysisCardProps> = ({ value, label, icon }) => (
  <div className="flex items-center justify-between bg-white rounded-xl p-4 sm:p-6 lg:p-7 w-full min-w-[280px] sm:min-w-[400px] lg:min-w-[550px]">
    <div>
      <div className="text-2xl sm:text-3xl lg:text-3xl font-bold text-black">{value}</div>
      <div className="text-xs sm:text-sm lg:text-sm text-gray-500 mt-1">{label}</div>
    </div>
    <div
      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 rounded-md"
      style={{
        background: 'linear-gradient(135deg, #C522A7 0%, #A31680 100%)',
      }}
    >
      <span className="text-white text-xl sm:text-2xl lg:text-2xl">{icon}</span>
    </div>
  </div>
);

export default InDepthAnalysisCard; 