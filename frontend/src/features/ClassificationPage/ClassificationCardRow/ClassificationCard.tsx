import React from "react";

interface ClassificationStatCardProps {
  value: string | number;
  label: string;
  subtitle: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  bgColor?: string | [string, string]; // Accepts a single color or two hex values for gradient
  onClick?: () => void;
  isActive?: boolean;
}

const ClassificationStatCard: React.FC<ClassificationStatCardProps> = ({ value, label, subtitle, badge, icon, bgColor = "#3b82f6", onClick, isActive = false }) => {
  // Determine background style
  const iconBgStyle: React.CSSProperties = {};
  let iconBgClass = "";
  if (Array.isArray(bgColor) && bgColor.length === 2) {
    iconBgStyle.background = `linear-gradient(135deg, ${bgColor[0]}, ${bgColor[1]})`;
  } else if (typeof bgColor === "string" && bgColor.startsWith("#")) {
    iconBgStyle.background = bgColor;
  } else if (typeof bgColor === "string") {
    iconBgClass = bgColor;
  }

  return (
    <div 
      className={`flex flex-col items-start bg-white rounded-2xl shadow-md p-8 min-w-[270px] max-w-[300px] w-full h-49 relative cursor-pointer transition-all duration-200 ${
        isActive ? 'shadow-lg hover:scale-105' : 'hover:shadow-lg hover:scale-105'
      }`}
      style={isActive && Array.isArray(bgColor) && bgColor.length === 2 ? {
        border: `2px solid transparent`,
        background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${bgColor[0]}, ${bgColor[1]}) border-box`
      } : isActive && typeof bgColor === "string" && bgColor.startsWith("#") ? {
        border: `2px solid ${bgColor}`
      } : {}}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl mr-2 overflow-hidden ${iconBgClass}`}
          style={iconBgStyle}
        >
          {icon}
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-700 text-base leading-tight">{label}</div>
      <div className="text-gray-400 text-sm mt-1">{subtitle}</div>
    </div>
  );
};

export default ClassificationStatCard;