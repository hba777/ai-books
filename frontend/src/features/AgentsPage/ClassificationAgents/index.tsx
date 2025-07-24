import React from "react";
import AgentListSection from "./AgentListSection";

const classificationIcon = (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.67 8.8418V4.8418H8.67004" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18.67 8.8418H6.67004C5.56547 8.8418 4.67004 9.73723 4.67004 10.8418V18.8418C4.67004 19.9464 5.56547 20.8418 6.67004 20.8418H18.67C19.7746 20.8418 20.67 19.9464 20.67 18.8418V10.8418C20.67 9.73723 19.7746 8.8418 18.67 8.8418Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.67004 14.8418H4.67004" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20.67 14.8418H22.67" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.67 13.8418V15.8418" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.67004 13.8418V15.8418" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
);

const agents = [
  {
    id: "1",
    name: "Content Moderation Agent",
    status: "Active" as const,
    description: "Classifies content for inappropriate material, spam, and policy violations",
  },
  {
    id: "1",
    name: "Document Classifier",
    status: "Active" as const,
    description: "Categorizes documents by type, department, and priority level",
  },
  {
    id: "1",
    name: "Email Priority Agent",
    status: "Disabled" as const,
    description: "Classifies incoming emails by urgency and routes them to appropriate teams",
  },
];

const ClassificationAgents: React.FC = () => (
  <AgentListSection
    sectionTitle="Classification Agents"
    sectionDescription="Manage your Deployed AI Classification Agents"
    agents={agents}
    icon={classificationIcon}
    onAdd={() => {}}
  />
);

export default ClassificationAgents; 