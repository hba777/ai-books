import React from 'react';

interface InDepthAnalysisCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
}

const InDepthAnalysisCard: React.FC<InDepthAnalysisCardProps> = ({ value, label, icon }) => (
  <div className="flex items-center justify-between bg-white rounded-xl shadow p-7 min-w-[550px]">
    <div>
      <div className="text-3xl font-bold text-black">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
    <div
      className="flex items-center justify-center w-12 h-12 rounded-md"
      style={{
        background: 'linear-gradient(135deg, #C522A7 0%, #A31680 100%)',
      }}
    >
      <span className="text-white text-2xl">{icon}</span>
    </div>
  </div>
);

export default InDepthAnalysisCard; 