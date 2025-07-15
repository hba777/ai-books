import React from "react";

interface AddAgentSectionProps {
  title: string;
  description: string;
  onAdd: () => void;
  buttonLabel?: string;
}

const AddAgentSection: React.FC<AddAgentSectionProps> = ({
  title,
  description,
  onAdd,
  buttonLabel = "+ Add Agent",
}) => (
  <div className="flex items-center justify-between mb-2 w-full">
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-black">{title}</span>
      <span className="text-base text-gray-500">{description}</span>
    </div>
    <button
      className="bg-gradient-to-r from-[#3B82F6] to-[#9333EA] text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition flex items-center gap-2 cursor-pointer"
      onClick={onAdd} // Calls the onAdd handler passed as a prop
    >
      {buttonLabel}
    </button>
  </div>
);

export default AddAgentSection;
