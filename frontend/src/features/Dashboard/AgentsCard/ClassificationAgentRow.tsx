import React, { useRef } from "react";
import { Agent } from '../../../services/agentsApi';

interface ClassificationAgentRowProps {
  agents: Agent[];
  icon?: React.ReactNode;
}

const ClassificationAgentRow: React.FC<ClassificationAgentRowProps> = ({
  agents,
  icon
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    rowRef.current?.classList.add("active");
    startX.current = e.pageX - (rowRef.current?.offsetLeft || 0);
    scrollLeft.current = rowRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    rowRef.current?.classList.remove("active");
  };

  const handleMouseUp = () => {
    isDown.current = false;
    rowRef.current?.classList.remove("active");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - (rowRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.2; // scroll speed multiplier
    if (rowRef.current) {
      rowRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  return (
    <div
      ref={rowRef}
      className="flex gap-4 w-full overflow-x-auto cursor-grab select-none"
      style={{ scrollbarWidth: "none" }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {agents.map((agent) => (
        <div
          key={agent._id}
          className="flex flex-col bg-[#EFF6FF] rounded-xl p-4 min-w-[200px] max-w-[220px] h-35 shadow-sm relative overflow-hidden border border-[#2563EB]"
        >
          <div className="flex flex-col gap-3 mb-1 mt-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2563EB]">
              {icon}
            </div>
            <div className="font-semibold text-gray-800 text-base">
              {agent.agent_name}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {agent.status ? "Active" : "Inactive"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassificationAgentRow;
