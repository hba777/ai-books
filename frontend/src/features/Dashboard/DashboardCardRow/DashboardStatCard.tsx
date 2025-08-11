import React from "react";

interface DashboardStatCardProps {
  value: string | number;
  label: string;
  subtitle: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  bgColor?: string | [string, string]; // Accepts a single color or two hex values for gradient
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ value, label, subtitle, badge, icon, bgColor = "#3b82f6" }) => {
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
      className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 w-full min-w-[200px] sm:min-w-[240px] lg:min-w-[260px] max-w-[280px] h-40 sm:h-48 lg:h-55 relative"
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl lg:text-2xl mr-2 overflow-hidden ${iconBgClass}`}
          style={iconBgStyle}
        >
          {icon}
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>
      <div className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-700 font text-sm sm:text-base lg:text-base leading-tight">{label}</div>
      <div className="text-gray-400 text-xs sm:text-sm lg:text-sm mt-1">{subtitle}</div>
    </div>
  );
};

export default DashboardStatCard;