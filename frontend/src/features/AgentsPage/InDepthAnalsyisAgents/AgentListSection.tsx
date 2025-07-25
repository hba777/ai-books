import React, { useState } from "react";
import AddAnalysisAgentSection from "../AddAgent/AddAnalysisAgent";
import AgentCard from "./AgentCard";
import InDepthAnalysisAgentForm from "./InDepthAnalysisAgentForm";
import DeleteAgent from "../DeleteAgent/DeleteAgent";
import api from "@/lib/api";
import { FaPlay } from "react-icons/fa";
import { toast } from "react-toastify";
import { Agent as BackendAgent } from "@/services/agentsApi";
import { useAgents } from "@/context/AgentsContext";

interface Agent extends BackendAgent {
  name?: string;
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
}) => {
  const { powerToggleAgent } = useAgents();
  const [isAddFormOpen, setisAddFormOpen] = useState(false);
  const [isEditFormOpen, setisEditFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  const handleOpenForm = () => setisAddFormOpen(true);
  const handleEditOpenform = (agent: Agent) => {
    setEditingAgent(agent);
    setisEditFormOpen(true);
  };
  const handleDeleteOpen = (agent: Agent) => {
    setDeletingAgent(agent);
    setIsDeleteOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (deletingAgent) {
      await api.delete(`/agents/${deletingAgent.id}`);
      setIsDeleteOpen(false);
      setDeletingAgent(null);
      // Optionally: refresh agent list here
    }
  };

  const handlePowerClick = async (agentId: string, currentStatus: boolean | undefined) => {
    try {
      await powerToggleAgent(agentId, !!currentStatus);
      toast.success(currentStatus === false ? "Powered on" : "Powered off");
    } catch (err) {
      toast.error("Failed to toggle power");
    }
  };

  return (
    <div className="mb-10 w-full">
      <AddAnalysisAgentSection
        title={sectionTitle}
        description={sectionDescription}
        onAdd={handleOpenForm}
      />
      <div className="mt-4">
        {agents.map((agent, idx) => (
          <AgentCard
            key={(agent.name || agent.agent_name || "") + idx}
            name={agent.name || agent.agent_name || "Unnamed Agent"}
            status={agent.status === false ? "Disabled" : "Active"}
            description={agent.description || agent.criteria || agent.guidelines || agent.classifier_prompt || agent.evaluators_prompt || "No description"}
            icon={icon}
          >
            <button onClick={() => handlePowerClick(agent.id, agent.status)}
              className={agent.status === false ? "text-blue-500 hover:text-blue-700 focus:outline-none" : ""}
              title={agent.status === false ? "Powered Off" : "Powered On"}
            >
              {agent.status === false ? <FaPlay /> : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: 'pointer' }}
                >
                  <g clipPath="url(#clip0_1_10435)">
                    <path
                      d="M7.80078 1.36621V7.84164"
                      stroke="#394560"
                      strokeWidth="1.5541"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.9452 4.34473C12.7589 5.15876 13.3134 6.19552 13.5387 7.32426C13.7639 8.453 13.6499 9.62317 13.211 10.6872C12.7721 11.7512 12.028 12.6615 11.0724 13.3031C10.1169 13.9448 8.99275 14.2892 7.84175 14.2928C6.69076 14.2964 5.56446 13.9591 4.60492 13.3234C3.64537 12.6877 2.89553 11.7822 2.44998 10.7209C2.00442 9.65965 1.88309 8.49021 2.10129 7.36008C2.31949 6.22995 2.86745 5.18974 3.67607 4.37063"
                      stroke="#394560"
                      strokeWidth="1.5541"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1_10435">
                      <rect
                        width="15.541"
                        height="15.541"
                        fill="white"
                        transform="translate(0.0302734 0.0712891)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              )}
            </button>
          </AgentCard>
        ))}
      </div>
      {isAddFormOpen && (
        <InDepthAnalysisAgentForm
          mode="add"
          onCancel={() => setisAddFormOpen(false)}
          onSubmit={() => setisAddFormOpen(false)}
        />
      )}
      {isEditFormOpen && editingAgent && (
        <InDepthAnalysisAgentForm
          mode="edit"
          initialValues={{ ...editingAgent, status: editingAgent?.status === false ? "Disabled" : "Active" }}
          agentId={editingAgent.id}
          onCancel={() => {
            setisEditFormOpen(false);
            setEditingAgent(null);
          }}
          onSubmit={() => {
            setisEditFormOpen(false);
            setEditingAgent(null);
          }}
        />
      )}
      {isDeleteOpen && deletingAgent && (
        <DeleteAgent
          open={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeletingAgent(null);
          }}
          onConfirm={handleDeleteConfirm}
          agentName={deletingAgent?.name || deletingAgent?.agent_name}
        />
      )}
    </div>
  );
};

export default AgentListSection; 