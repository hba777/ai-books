import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import TopSection from "@/features/AnalysisDetailsPage/TopSection/TopSection";
import AnalysisTable from "@/features/AnalysisDetailsPage/AnalysisTable/AnalysisTable";
import SeeInfo from "@/features/ClassificationDetailsPage/SeeInfo";
import { useRouter } from "next/router";
import { Book } from "@/services/booksApi";
import { useBooks } from "@/context/BookContext";

const mockRows = [
  { pageNo: "01", paragraph: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you...", confidence: "54%", observations: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you..." },
  { pageNo: "234", paragraph: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you...", confidence: "54%", observations: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you..." },
  { pageNo: "78", paragraph: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you...", confidence: "54%", observations: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you..." },
  { pageNo: "900", paragraph: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you...", confidence: "54%", observations: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you..." },
  { pageNo: "25", paragraph: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you...", confidence: "54%", observations: "If system integration fails: 'I'm having trouble accessing our scheduling system right now. Let me collect you..." },
];

const mockTags = ["Political", "Maths", "IT/CS", "Maths", "Maths"];

const AnalysisDetails: React.FC = () => {
  const [showSeeInfo, setShowSeeInfo] = useState(false);
  const [book, setBook] = useState<Book>(); 
  const router = useRouter();
  const { id } = router.query;
  const { getBookById} = useBooks();

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const bookData = await getBookById(id as string);
        setBook(bookData);
  
       
      } catch (err) {
        console.error("Failed to fetch book or file:", err);
      } 
    };
  
    fetchData();
  
    return;
  }, [id]);

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Book not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f7f9fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12 w-full">
          <div className="w-full max-w-7xl">
            <TopSection bookTitle="The Kite Runner" tags={mockTags} bookId={id as string} onSeeInfo={()=>setShowSeeInfo(true)} />
            <AnalysisTable rows={mockRows} />
          </div>
        </div>
      </main>
      {showSeeInfo && <SeeInfo book={book} onClose={() => setShowSeeInfo(false)} />}

    </div>
  );
};

export default AnalysisDetails;
