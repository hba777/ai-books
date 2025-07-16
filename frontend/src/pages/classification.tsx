import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { WelcomeSection } from "@/features/ClassificationPage/WelcomeSection/WelcomeSection";
import ClassificationCardRow from "@/features/ClassificationPage/ClassificationCardRow/ClassificationCardRow";
import BookTable from "@/components/BookTable/BooksView";
import { ClassificationProvider } from "@/features/ClassificationPage/ClassificationCardRow/ClassificationContext";
import UploadButtonForm from "@/components/UploadButtonForm/UploadButtonForm";
import ProcessingCard from "@/components/ProcessingCard/ProcessingCard";

const Classifcation: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ClassificationProvider>
      <div className="min-h-screen flex bg-[#f7f9fc]">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col items-center px-4 py-12">
            <WelcomeSection onUploadClick={() => setModalOpen(true)} />
            <ClassificationCardRow/>
            <div className="w-full flex justify-start mb-6">
            <ProcessingCard/>
            </div>
            <BookTable/>
          </div>
        </main>
        <UploadButtonForm open={modalOpen} onClose={() => setModalOpen(false)} />

      </div>
    </ClassificationProvider>
  );
};

export default Classifcation;
