import React from "react";

interface AgentCardProps {
  name: string;
  status: "Active" | "Disabled";
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode; // For action buttons
}

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Disabled: "bg-red-100 text-red-700",
};

const AgentCard: React.FC<AgentCardProps> = ({ name, status, description, icon, children }) => (
  <div className="flex items-center justify-between bg-white rounded-xl shadow p-5 mb-4 w-full">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#C522A7] to-[#A31680]">
        {icon}
      </div>
      <div className="flex flex-col">
      <div className="flex">
        <span className="text-lg font-semibold text-gray-900">{name}</span>
        <span className="text-xs mt-1 {statusColors[status]} px-2 py-0.5 rounded font-semibold inline-block">
          <span className={`text-xs px-2 py-0.5 rounded font-semibold inline-block ${statusColors[status]}`}>{status}</span>
        </span>
        </div>
        <span className="text-sm text-gray-500 mt-1">{description}</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
);

export default AgentCard; 