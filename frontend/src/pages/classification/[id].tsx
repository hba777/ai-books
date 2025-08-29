import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ClassificationDetailsCard from "@/features/ClassificationDetailsPage/ClassificationDetailsCard";
import PDFViewerActual from "@/features/ClassificationDetailsPage/PDFViewer";
import SeeInfo from "@/features/ClassificationDetailsPage/SeeInfo";
import { useRouter } from "next/router";
import { useBooks } from "@/context/BookContext";
import { useUser } from "@/context/UserContext";
import { Book, ClassificationEntry } from "@/services/booksApi";

const ClassifcationDetails: React.FC = () => {
  const [showSeeInfo, setShowSeeInfo] = useState(false);
  const [jumpToHighlight, setJumpToHighlight] = useState<{
    className: string;
    direction: "next" | "prev";
  } | null>(null);
  const [currentClassificationCoordinates, setCurrentClassificationCoordinates] = useState<number[] | undefined>(undefined);
  const [currentClassificationPage, setCurrentClassificationPage] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book>(); 
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);

  const router = useRouter();
  const { id } = router.query; // URL: /classification/[id]
  const { getBookById, getBookFile, getBookClassifications } = useBooks();
  const { user, loading: userLoading } = useUser();

  // Function to handle jumping to highlight with coordinates
  const handleJumpToHighlight = async (pageNumber: string, direction: "next" | "prev", coordinates?: number[]) => {
    if (!id || typeof id !== "string") return;
    
    // If coordinates are provided directly, use them
    if (coordinates && pageNumber) {
      setCurrentClassificationCoordinates(coordinates);
      setCurrentClassificationPage(parseInt(pageNumber));
      setJumpToHighlight({ className: "navigation", direction });
      return;
    }
    
    // Fallback to the old logic if coordinates are not provided
    try {
      const response = await getBookClassifications(id);
      // Since we don't have className in this context, we'll need to handle this differently
      // For now, just log that fallback was used
      console.log("Fallback navigation used - coordinates not provided");
    } catch (error) {
      console.error("Error in fallback navigation:", error);
    }
  };

  // Function to set initial coordinates when classifications are first loaded
  const setInitialClassificationCoordinates = async () => {
    if (!id || typeof id !== "string") return;
    
    try {
      const response = await getBookClassifications(id);
      if (response.classifications && response.classifications.length > 0) {
        // Set the first classification with coordinates as the initial one
        const firstEntryWithCoordinates = response.classifications.find(
          (entry: ClassificationEntry) => entry.coordinates && entry.page_number
        );
        
        if (firstEntryWithCoordinates) {
          setCurrentClassificationCoordinates(firstEntryWithCoordinates.coordinates);
          setCurrentClassificationPage(firstEntryWithCoordinates.page_number);
        }
      }
    } catch (error) {
      console.error("Error setting initial classification coordinates:", error);
    }
  };

  // Fetch book details and file when `id` is available
  useEffect(() => {
    if (!id || userLoading || !user) return;

    let objectUrl: string | null = null;
    let isCancelled = false;

    const fetchData = async () => {
      try {
        const bookData = await getBookById(id as string);
        if (isCancelled) return;
        setBook(bookData);

        const fileBlob = await getBookFile(id as string);
        if (isCancelled) return;
        objectUrl = URL.createObjectURL(fileBlob);
        setFileUrl(objectUrl);
        setCurrentBlobUrl(objectUrl);
        
        // Set initial classification coordinates after book data is loaded
        if (!isCancelled) {
          await setInitialClassificationCoordinates();
        }
              } catch (err: any) {
          if (isCancelled) return;
          console.error("Failed to fetch book or file:", err);
          // If it's an authentication error, redirect to login
          if (err.response?.status === 401) {
            router.push('/');
          }
        } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to revoke blob URL when component unmounts
    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, getBookById, getBookFile, user, userLoading, router]);

  // Cleanup blob URL when component unmounts or when fileUrl changes
  useEffect(() => {
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [currentBlobUrl]);

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
            <div className="flex flex-col w-[400px] shrink-0">
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
                onJumpToHighlight={handleJumpToHighlight}
              />
            </div>

            {/* Right Column */}
            <div className="flex-3">
              {fileUrl ? (
                <PDFViewerActual
                  jumpToHighlight={jumpToHighlight}
                  fileUrl={fileUrl}
                  doc_name={book.doc_name}
                  currentClassificationCoordinates={currentClassificationCoordinates}
                  currentClassificationPage={currentClassificationPage}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p>Loading PDF...</p>
                </div>
              )}
            </div>
          </div>

          {showSeeInfo && book && <SeeInfo onClose={() => setShowSeeInfo(false)} book={book} />}
        </div>
      </main>
    </div>
  );
};

export default ClassifcationDetails;
