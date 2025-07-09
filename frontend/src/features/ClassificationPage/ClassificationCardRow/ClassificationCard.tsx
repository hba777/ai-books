import React from "react";

interface ClassificationStatCardProps {
  value: string | number;
  label: string;
  subtitle: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  bgColor?: string | [string, string]; // Accepts a single color or two hex values for gradient
}

const ClassificationStatCard: React.FC<ClassificationStatCardProps> = ({ value, label, subtitle, badge, icon, bgColor = "#3b82f6" }) => {
  // Determine background style
  let iconBgStyle: React.CSSProperties = {};
  let iconBgClass = "";
  if (Array.isArray(bgColor) && bgColor.length === 2) {
    iconBgStyle.background = `linear-gradient(135deg, ${bgColor[0]}, ${bgColor[1]})`;
  } else if (typeof bgColor === "string" && bgColor.startsWith("#")) {
    iconBgStyle.background = bgColor;
  } else if (typeof bgColor === "string") {
    iconBgClass = bgColor;
  }

  return (
    <div className="flex flex-col items-start bg-white rounded-2xl shadow p-6 min-w-[170px] max-w-[200px] w-full h-44 relative">
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
      <div className="text-gray-700 font-semibold text-base leading-tight">{label}</div>
      <div className="text-gray-400 text-sm mt-1">{subtitle}</div>
    </div>
  );
};

export default ClassificationStatCard;