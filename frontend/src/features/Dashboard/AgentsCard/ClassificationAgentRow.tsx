import React from 'react';
import { Agent } from '../../../services/agentsApi';

interface ClassificationAgentRowProps {
  agents: Agent[];
}

const icon = (
<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.67 8.8418V4.8418H8.67004" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M18.67 8.8418H6.67004C5.56547 8.8418 4.67004 9.73723 4.67004 10.8418V18.8418C4.67004 19.9464 5.56547 20.8418 6.67004 20.8418H18.67C19.7746 20.8418 20.67 19.9464 20.67 18.8418V10.8418C20.67 9.73723 19.7746 8.8418 18.67 8.8418Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M2.67004 14.8418H4.67004" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M20.67 14.8418H22.67" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M15.67 13.8418V15.8418" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M9.67004 13.8418V15.8418" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

const ClassificationAgentRow: React.FC<ClassificationAgentRowProps> = ({ agents }) => (
  <div className="flex gap-4 w-full">
    {agents.map((agent) => (
      <div key={agent._id} className="flex flex-col bg-[#EFF6FF] rounded-xl p-4 min-w-[200px] max-w-[220px] h-35 shadow-sm relative overflow-hidden border border-[#2563EB]">
        <div className="flex flex-col gap-3 mb-1 mt-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2563EB]">
            {icon}
          </div>
          <div className="font-semibold text-gray-800 text-base">{agent.agent_name}</div>
        </div>
        <div className="text-xs text-gray-500">{agent.status ? 'Active' : 'Inactive'}</div>
      </div>
    ))}
  </div>
);

export default ClassificationAgentRow; 