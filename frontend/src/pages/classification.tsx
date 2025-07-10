import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { WelcomeSection } from "@/components/Header/WelcomeSection";
import ClassificationCardRow from "@/features/ClassificationPage/ClassificationCardRow/ClassificationCardRow";
import BookTable from "@/features/ClassificationPage/BookTable/BookTable";
import { ClassificationProvider } from "@/features/ClassificationPage/ClassificationCardRow/ClassificationContext";
import UploadButtonForm from "@/features/ClassificationPage/UploadButtonForm/UploadButtonForm";

const Classifcation: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ClassificationProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col items-center px-4 py-12">
            <WelcomeSection onUploadClick={() => setModalOpen(true)} />
            <ClassificationCardRow/>
            <BookTable/>

          </div>
        </main>
        <UploadButtonForm open={modalOpen} onClose={() => setModalOpen(false)} />

      </div>
    </ClassificationProvider>
  );
};

export default Classifcation;
