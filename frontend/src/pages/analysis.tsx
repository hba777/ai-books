import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import BookTable from "@/components/BookTable/BooksView";
import { ClassificationProvider } from "@/features/ClassificationPage/ClassificationCardRow/ClassificationContext";
import ProcessingCard from "@/components/ProcessingCard/ProcessingCard";
import InDepthAnalysisCardRow from "@/features/InDepthAnalysisPage/InDepthAnalysisCardRow/InDepthAnalysisCardRow";
import HeroSection from "@/features/InDepthAnalysisPage/HeroSection/HeroSection";

const bookTableFilters = [
  { value: "All", label: "All Classified Books" },
  { value: "Analysed", label: "Analysed Books" },
  { value: "Analysing", label: "Currently Analysing Books" },
  { value: "Pending", label: "Pending Books" },
];

const Analysis: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ClassificationProvider>
      <div className="min-h-screen flex bg-[#f7f9fc]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col items-center px-4 py-12">
            <HeroSection />
            <InDepthAnalysisCardRow/>
            <div className="w-full flex justify-start mb-4 mt-4">
              <ProcessingCard />
            </div>
            <BookTable filterOptions={bookTableFilters} />
          </div>
        </main>
      </div>
    </ClassificationProvider>
  );
};

export default Analysis;
