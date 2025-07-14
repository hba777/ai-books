import React from "react";
import AddAgentSection from "../AddAgent/AddAgentSection";
import AgentCard from "./AgentCard";

interface Agent {
  name: string;
  status: "Active" | "Disabled";
  description: string;
}

interface AgentListSectionProps {
  sectionTitle: string;
  sectionDescription: string;
  agents: Agent[];
  icon: React.ReactNode;
  onAdd: () => void;
}

const AgentListSection: React.FC<AgentListSectionProps> = ({
  sectionTitle,
  sectionDescription,
  agents,
  icon,
  onAdd,
}) => (
  <div className="mb-10 w-full">
    <AddAgentSection
      title={sectionTitle}
      description={sectionDescription}
      onAdd={onAdd}
    />
    <div className="mt-4">
      {agents.map((agent, idx) => (
        <AgentCard
          key={agent.name + idx}
          name={agent.name}
          status={agent.status}
          description={agent.description}
          icon={icon}
        >
          {/* Action buttons placeholder */}
        </AgentCard>
      ))}
    </div>
  </div>
);

export default AgentListSection; 