import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import TopSection from "@/features/AnalysisDetailsPage/TopSection/TopSection";
import AnalysisTable from "@/features/AnalysisDetailsPage/AnalysisTable/AnalysisTable";
import SeeInfo from "@/features/ClassificationDetailsPage/SeeInfo";
import { useRouter } from "next/router";
import { Book } from "@/services/booksApi";
import { useBooks, ReviewOutcomesResponse } from "@/context/BookContext";

const mockTags = ["Political", "Maths", "IT/CS", "Maths", "Maths"];

const PAGE_SIZE = 10;

const AnalysisDetails: React.FC = () => {
  const [showSeeInfo, setShowSeeInfo] = useState(false);
  const [book, setBook] = useState<Book>(); 
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { id } = router.query;
  const { getBookById, reviewOutcomes, fetchReviewOutcomes } = useBooks();

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
  }, [id, getBookById]);

  useEffect(() => {
    fetchReviewOutcomes();
  }, []);

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Book not found.</p>
      </div>
    );
  }

  // Filter review outcomes for this book
  const bookReviewOutcomes = reviewOutcomes.filter(
    (r) => r.doc_id === book._id || r.Book_Name === book.doc_name
  );

  const totalPages = Math.ceil(bookReviewOutcomes.length / PAGE_SIZE);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f9fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12 w-full">
          <div className="w-full max-w-7xl">
            <TopSection bookTitle={book.doc_name} tags={mockTags} bookId={book._id} onSeeInfo={()=>setShowSeeInfo(true)} />
            {book.status === "Processed" ? (
              <AnalysisTable
                data={bookReviewOutcomes}
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            ) : (
              <div className="flex justify-center items-center h-40 text-xl font-semibold text-gray-500">
                Analysis Pending
              </div>
            )}
          </div>
        </div>
      </main>
      {showSeeInfo && <SeeInfo book={book} onClose={() => setShowSeeInfo(false)} />}
    </div>
  );
};

export default AnalysisDetails;
