import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Header } from "../components/Header/Header";
import { WelcomeSection } from "@/features/ClassificationPage/WelcomeSection/WelcomeSection";
import DashboardCardRow from "@/features/Dashboard/DashboardCardRow/DashboardCardRow";
import AgentsCard from "@/features/Dashboard/AgentsCard/AgentsCard";
import UploadButtonForm from "@/components/UploadButtonForm/UploadButtonForm";
import ProcessingCard from "@/components/ProcessingCard/ProcessingCard";
import AnalysisCardRow from "@/features/Dashboard/AnalysisCardRow/AnalysisCardRow";

const Dashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
      <div className="min-h-screen flex bg-[#f7f9fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          <WelcomeSection onUploadClick={() => setModalOpen(true)}/>
          <div className="w-full flex justify-start mb-6">
            <ProcessingCard/>
          </div>
          <DashboardCardRow/>
          <AnalysisCardRow/>
          <AgentsCard/>
        </div>
      </main>
      <UploadButtonForm open={modalOpen} onClose={() => setModalOpen(false)}/>
    </div>
  );
};

export default Dashboard;
