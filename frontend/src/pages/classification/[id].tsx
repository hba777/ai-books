import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ClassificationDetailsCard from "@/features/ClassificationDetailsPage/ClassificationDetailsCard";
import PDFViewerActual from "@/features/ClassificationDetailsPage/PDFViewer";
import SeeInfo from "@/features/ClassificationDetailsPage/SeeInfo";
import { useRouter } from "next/router";
import { useBooks } from "@/context/BookContext";
import { Book } from "@/services/booksApi";

const ClassifcationDetails: React.FC = () => {
  const [showSeeInfo, setShowSeeInfo] = useState(false);
  const [jumpToHighlight, setJumpToHighlight] = useState<{
    className: string;
    direction: "next" | "prev";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book>(); 
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const router = useRouter();
  const { id } = router.query; // URL: /classification/[id]
  const { getBookById, getBookFile } = useBooks();

  // Fetch book details and file when `id` is available
  useEffect(() => {
  if (!id) return;

  let objectUrl: string | null = null;

  const fetchData = async () => {
    try {
      const bookData = await getBookById(id as string);
      setBook(bookData);

      const fileBlob = await getBookFile(id as string);
      objectUrl = URL.createObjectURL(fileBlob);
      setFileUrl(objectUrl);
    } catch (err) {
      console.error("Failed to fetch book or file:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [id]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading book details...</p>
      </div>
    );
  }

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
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          <div className="flex w-full max-w-7xl gap-6">
            {/* Left Column */}
            <div className="flex flex-col w-[350px] shrink-0">
              {/* Breadcrumb/Header Bar */}
              <div className="flex items-center mb-4">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-white hover:bg-gray-100 mr-2 p-2 border border-gray-400"
                  onClick={() => router.back()}
                  aria-label="Go back"
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 19l-7-7 7-7"
                      stroke="#222"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="font-bold text-gray-900 text-base">
                  Classification Books
                </span>
                <span className="mx-1 text-gray-400">/</span>
                <span className="text-gray-400 text-base">{book.doc_name}</span>
              </div>

              {/* Card below breadcrumb */}
              <ClassificationDetailsCard
                onSeeInfo={() => setShowSeeInfo(true)}
                onJumpToHighlight={(className, direction) =>
                  setJumpToHighlight({ className, direction })
                }
              />
            </div>

            {/* Right Column */}
            <div className="flex-1">
              {fileUrl ? (
                <PDFViewerActual
                  jumpToHighlight={jumpToHighlight}
                  fileUrl={fileUrl}
                  doc_name={book.doc_name}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p>Loading PDF...</p>
                </div>
              )}
            </div>
          </div>

          {showSeeInfo && <SeeInfo onClose={() => setShowSeeInfo(false)} />}
        </div>
      </main>
    </div>
  );
};

export default ClassifcationDetails;
