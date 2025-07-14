import Sidebar from "../components/Sidebar/Sidebar";
import { Header } from "../components/Header/Header";
import { WelcomeSection } from "@/features/ClassificationPage/WelcomeSection/WelcomeSection";
import InDepthAnalysisCardRow from "@/features/InDepthAnalysisPage/InDepthAnalysisCardRow/InDepthAnalysisCardRow";
import DashboardCardRow from "@/features/Dashboard/DashboardCardRow/DashboardCardRow";
import AgentsCard from "@/features/Dashboard/AgentsCard/AgentsCard";

const Dashboard: React.FC = () => {

  return (
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          <WelcomeSection />
          <DashboardCardRow/>
          <InDepthAnalysisCardRow/>
          <AgentsCard/>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
