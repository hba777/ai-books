import React, { useState } from "react";
import AddAgentSection from "../AddAgent/AddAgentSection";
import AgentCard from "./AgentCard";
import InDepthAnalysisAgentForm from "./InDepthAnalysisAgentForm";
import DeleteAgent from "../DeleteAgent/DeleteAgent";
import api from "@/lib/api";

interface Agent {
  id: string;
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
}) => {
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
  return (
    <div className="mb-10 w-full">
      <AddAgentSection
        title={sectionTitle}
        description={sectionDescription}
        onAdd={handleOpenForm}
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
            <svg onClick={() => handleEditOpenform(agent)}
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1_10433)">
                <path
                  d="M16.5509 5.834C16.6986 5.98165 16.8924 6.05585 17.0862 6.05585C17.2801 6.05585 17.4739 5.98165 17.6215 5.834C17.9176 5.53795 17.9176 5.05943 17.6215 4.76338L14.5929 1.73473C14.2969 1.43868 13.8183 1.43868 13.5223 1.73473C13.2262 2.03078 13.2262 2.50931 13.5223 2.80536L16.5509 5.834Z"
                  fill="#394560"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.40769 17.9486C1.55155 18.0925 1.74462 18.1704 1.943 18.1704C2.00963 18.1704 2.07626 18.1614 2.14213 18.1439L6.30652 17.0082C6.43372 16.9734 6.54957 16.906 6.6427 16.8128L15.3501 8.10549C15.6461 7.80944 15.6461 7.33091 15.3501 7.03486L12.3214 4.00622C12.0254 3.71017 11.5468 3.71017 11.2508 4.00622L2.54343 12.7136C2.4503 12.8067 2.38291 12.9226 2.34808 13.0498L1.21234 17.2141C1.14117 17.4761 1.21537 17.7563 1.40769 17.9486ZM3.02195 16.3351L3.7564 13.6426L11.7861 5.61216L13.7441 7.57018L5.71366 15.6006L3.02195 16.3351Z"
                  fill="#394560"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_10433">
                  <rect
                    width="18.1719"
                    height="18.1719"
                    fill="white"
                    transform="translate(0.428711 0.755859)"
                  />
                </clipPath>
              </defs>
            </svg>
            <svg onClick={() => handleDeleteOpen(agent)}
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1_10434)">
                <path
                  d="M7.80094 14.3844C7.38299 14.3844 7.04378 14.046 7.04378 13.6273V9.08431C7.04378 8.66636 7.38299 8.32715 7.80094 8.32715C8.2189 8.32715 8.55811 8.66636 8.55811 9.08431V13.6273C8.55811 14.046 8.2189 14.3844 7.80094 14.3844Z"
                  fill="#DC5D5D"
                />
                <path
                  d="M10.0724 13.6273C10.0724 14.046 10.4109 14.3844 10.8296 14.3844C11.2483 14.3844 11.5868 14.046 11.5868 13.6273V9.08431C11.5868 8.66636 11.2483 8.32715 10.8296 8.32715C10.4109 8.32715 10.0724 8.66636 10.0724 9.08431V13.6273Z"
                  fill="#DC5D5D"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.52946 4.54134V3.78418C5.52946 2.61664 6.6334 1.5127 7.80094 1.5127H10.8296C11.9971 1.5127 13.1011 2.61664 13.1011 3.78418V4.54134H16.1297C16.5484 4.54134 16.8869 4.88055 16.8869 5.2985C16.8869 5.71646 16.5484 6.05566 16.1297 6.05566H15.3726V15.8988C15.3726 17.0663 14.2686 18.1702 13.1011 18.1702H5.52946C4.36192 18.1702 3.25798 17.0663 3.25798 15.8988V6.05566H2.50081C2.08286 6.05566 1.74365 5.71646 1.74365 5.2985C1.74365 4.88055 2.08286 4.54134 2.50081 4.54134H5.52946ZM4.7723 6.05566V15.8988C4.7723 16.238 5.18949 16.6559 5.52946 16.6559H13.1011C13.4403 16.6559 13.8582 16.238 13.8582 15.8988V6.05566H4.7723ZM11.5868 3.78418V4.54134H7.04378V3.78418C7.04378 3.44421 7.46098 3.02702 7.80094 3.02702H10.8296C11.1688 3.02702 11.5868 3.44421 11.5868 3.78418Z"
                  fill="#DC5D5D"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_10434">
                  <rect
                    width="18.1719"
                    height="18.1719"
                    fill="white"
                    transform="translate(0.229492 0.755859)"
                  />
                </clipPath>
              </defs>
            </svg>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1_10435)">
                <path
                  d="M7.80078 1.36621V7.84164"
                  stroke="#394560"
                  stroke-width="1.5541"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M11.9452 4.34473C12.7589 5.15876 13.3134 6.19552 13.5387 7.32426C13.7639 8.453 13.6499 9.62317 13.211 10.6872C12.7721 11.7512 12.028 12.6615 11.0724 13.3031C10.1169 13.9448 8.99275 14.2892 7.84175 14.2928C6.69076 14.2964 5.56446 13.9591 4.60492 13.3234C3.64537 12.6877 2.89553 11.7822 2.44998 10.7209C2.00442 9.65965 1.88309 8.49021 2.10129 7.36008C2.31949 6.22995 2.86745 5.18974 3.67607 4.37063"
                  stroke="#394560"
                  stroke-width="1.5541"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
          initialValues={editingAgent}
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
          agentName={deletingAgent.name}
        />
      )}
    </div>
  );
};

export default AgentListSection; 