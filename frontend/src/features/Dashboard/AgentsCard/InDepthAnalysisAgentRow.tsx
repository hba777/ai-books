import React, { useRef } from "react";
import { Agent } from '../../../services/agentsApi';

interface InDepthAnalysisAgentRowProps {
  agents: Agent[];
}

const icon = (
  <svg
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.4372 2.24316H5.32196C4.88362 2.24316 4.46323 2.41729 4.15327 2.72725C3.84332 3.0372 3.66919 3.45759 3.66919 3.89594V17.1181C3.66919 17.5564 3.84332 17.9768 4.15327 18.2868C4.46323 18.5967 4.88362 18.7709 5.32196 18.7709H15.2386C15.6769 18.7709 16.0973 18.5967 16.4073 18.2868C16.7172 17.9768 16.8914 17.5564 16.8914 17.1181V11.0029"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.01636 5.54883H5.3219"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.01636 8.854H5.3219"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.01636 12.1597H5.3219"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.01636 15.4653H5.3219"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M18.03 5.23976C18.3592 4.91057 18.5442 4.46408 18.5442 3.99853C18.5442 3.53298 18.3592 3.08649 18.03 2.7573C17.7008 2.4281 17.2543 2.24316 16.7888 2.24316C16.3232 2.24316 15.8768 2.4281 15.5476 2.7573L11.4074 6.89914C11.2109 7.09551 11.0671 7.33823 10.9892 7.60488L10.2975 9.9766C10.2768 10.0477 10.2756 10.1231 10.2939 10.1948C10.3123 10.2666 10.3497 10.3321 10.402 10.3845C10.4544 10.4368 10.5199 10.4742 10.5917 10.4926C10.6634 10.5109 10.7388 10.5097 10.8099 10.489L13.1816 9.79728C13.4483 9.71941 13.691 9.5756 13.8874 9.37913L18.03 5.23976Z"
      stroke="#E5E7EB"
      stroke-width="1.65277"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const InDepthAnalysisAgentRow: React.FC<InDepthAnalysisAgentRowProps> = ({
  agents,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseLeave = () => {
    isDown = false;
  };

  const onMouseUp = () => {
    isDown = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 w-full cursor-grab select-none"
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {agents.map((agent) => (
        <div
          key={agent._id}
          className="flex flex-col bg-[#efe9fc] rounded-xl p-4 min-w-[200px] max-w-[220px] h-35 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col gap-3 mb-1 mt-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg from-[#A855F7] to-[#9333EA] bg-gradient-to-br">
              {icon}
            </div>
            <div className="font-semibold text-gray-800 text-base truncate">
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


export default InDepthAnalysisAgentRow;
