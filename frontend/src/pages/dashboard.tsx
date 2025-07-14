import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar/Sidebar";
import { Header } from "../components/Header/Header";
import { WelcomeSection } from "@/features/ClassificationPage/WelcomeSection/WelcomeSection";
import ClassificationCardRow from "@/features/ClassificationPage/ClassificationCardRow/ClassificationCardRow";
import { ClassificationProvider } from "@/features/ClassificationPage/ClassificationCardRow/ClassificationContext";

interface User {
  id: string;
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {

  return (
    <ClassificationProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          <WelcomeSection />
          <ClassificationCardRow/>
        </div>
      </main>
    </div>
    </ClassificationProvider>
  );
};

export default Dashboard;
