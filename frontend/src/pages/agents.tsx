import React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import ClassificationAgents from "@/features/AgentsPage/ClassificationAgents";
import InDepthAnalysisAgents from "@/features/AgentsPage/InDepthAnalsyisAgents";
import Header from "@/components/Header/Header";
import { useAgents } from "@/context/AgentsContext";

const Agents: React.FC = () => {
  const { agents, loading } = useAgents();

  const classificationAgents = agents.filter(a => a.type === "classification");
  const analysisAgents = agents.filter(a => a.type === "analysis");

  return (
    <div className="min-h-screen flex bg-[#f7f9fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header/>
        <div className="flex-1 flex flex-col items-center px-7 py-12">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading agents...</p>
            </div>
          ) : (
            <>
              <ClassificationAgents agents={classificationAgents} />
              <InDepthAnalysisAgents agents={analysisAgents} />
            </>
          )}
        </div>
      </main>   
    </div>
  );
};

export default Agents;
