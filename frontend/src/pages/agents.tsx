import React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import ClassificationAgents from "@/features/AgentsPage/ClassificationAgents";
import InDepthAnalysisAgents from "@/features/AgentsPage/InDepthAnalsyisAgents";
import Header from "@/components/Header/Header";

const Agents: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header/>
        <div className="flex-1 flex flex-col items-center px-7 py-12">
          <ClassificationAgents />
          <InDepthAnalysisAgents />
        </div>
      </main>   
    </div>
  );
};

export default Agents;
