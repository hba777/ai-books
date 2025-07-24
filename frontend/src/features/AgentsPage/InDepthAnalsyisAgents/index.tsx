import React from "react";
import AgentListSection from "./AgentListSection";

const analysisIcon = (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.67 2.8418H6.67004C6.13961 2.8418 5.6309 3.05251 5.25583 3.42758C4.88076 3.80266 4.67004 4.31136 4.67004 4.8418V20.8418C4.67004 21.3722 4.88076 21.8809 5.25583 22.256C5.6309 22.6311 6.13961 22.8418 6.67004 22.8418H18.67C19.2005 22.8418 19.7092 22.6311 20.0843 22.256C20.4593 21.8809 20.67 21.3722 20.67 20.8418V7.8418L15.67 2.8418Z"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.67 2.8418V6.8418C14.67 7.37223 14.8808 7.88094 15.2558 8.25601C15.6309 8.63108 16.1396 8.8418 16.67 8.8418H20.67"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M10.67 9.8418H8.67004"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16.67 13.8418H8.67004"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16.67 17.8418H8.67004"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const agents = [
  {
    id: "1",
    name: "Email Priority Agent",
    status: "Active" as const,
    description:
      "Classifies incoming emails by urgency and routes them to appropriate teams",
  },
  {
    id: "2",
    name: "Email Priority Agent",
    status: "Disabled" as const,
    description:
      "Classifies incoming emails by urgency and routes them to appropriate teams",
  },
];

const InDepthAnalysisAgents: React.FC = () => (
  <AgentListSection
    sectionTitle="In-Depth Analysis Agents"
    sectionDescription="Manage your Deployed In-Depth Analysis Agents"
    agents={agents}
    icon={analysisIcon}
    onAdd={() => {}}
  />
);

export default InDepthAnalysisAgents;
