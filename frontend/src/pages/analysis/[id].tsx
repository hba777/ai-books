import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import TopSection from "@/features/AnalysisDetailsPage/TopSection/TopSection";
import AnalysisTable from "@/features/AnalysisDetailsPage/AnalysisTable/AnalysisTable";
import ReviewFilters from "@/features/AnalysisDetailsPage/Filters/ReviewFilters";
import SeeInfo from "@/features/ClassificationDetailsPage/SeeInfo";
import { useRouter } from "next/router";
import { Book } from "@/services/booksApi";
import { useBooks } from "@/context/BookContext";

const mockTags = ["Political", "Maths", "IT/CS", "Maths", "Maths"];

const AnalysisDetails: React.FC = () => {
  const [showSeeInfo, setShowSeeInfo] = useState(false);
  const [minConfidence, setMinConfidence] = useState<number>(50);
  const [onlyHumanReviewed, setOnlyHumanReviewed] = useState<boolean>(false);
  const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
  const [book, setBook] = useState<Book>();
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();
  const { id } = router.query;
  const { getBookById, reviewOutcomes, fetchReviewOutcomes, getBookClassifications } = useBooks();

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

  useEffect(() => {
    const fetchTags = async () => {
      if (!book?._id) return;
      try {
        const res = await getBookClassifications(book._id);
        // Remove duplicates while preserving order
        const uniqueTags = Array.from(new Set(res.classifications || []));
        setTags(uniqueTags);
      } catch (e) {
        console.error("Failed to fetch classifications:", e);
        setTags([]);
      }
    };
    fetchTags();
  }, [book?._id, getBookClassifications]);

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

  // Derive available review types dynamically for this book without hardcoding names
  const formatKeyToTitle = (rawKey: string): string => {
    const noSuffix = rawKey.endsWith("Review") ? rawKey.slice(0, -6) : rawKey;
    const withSpaces = noSuffix
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
    const trimmed = withSpaces.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + (rawKey.endsWith("Review") ? " Review" : "");
  };

  const availableReviewTypes = Array.from(
    new Set(
      bookReviewOutcomes.flatMap((row) =>
        Object.entries(row as Record<string, unknown>)
          .filter(([k, v]) =>
            v && typeof v === "object" && (
              "problematic_text" in (v as Record<string, unknown>) ||
              "confidence" in (v as Record<string, unknown>) ||
              "issue_found" in (v as Record<string, unknown>) ||
              "human_review" in (v as Record<string, unknown>)
            )
          )
          .map(([k]) => k)
      )
    )
  ).map((key) => ({ key, title: formatKeyToTitle(key) }));

  return (
    <div className="min-h-screen flex bg-[#f7f9fc]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center px-4 py-12 w-full">
          <div className="w-full max-w-7xl">
            <TopSection bookTitle={book.doc_name} tags={tags} bookId={book._id} onSeeInfo={()=>setShowSeeInfo(true)} />
            <ReviewFilters
              minConfidence={minConfidence}
              onMinConfidenceChange={setMinConfidence}
              onlyHumanReviewed={onlyHumanReviewed}
              onOnlyHumanReviewedChange={setOnlyHumanReviewed}
              selectedReviewTypes={selectedReviewTypes}
              onSelectedReviewTypesChange={setSelectedReviewTypes}
              availableReviewTypes={availableReviewTypes}
            />
            {book.status === "Processed" ? (
              <AnalysisTable
                data={bookReviewOutcomes}
                pageSize={10}
                minConfidence={minConfidence}
                onlyHumanReviewed={onlyHumanReviewed}
                selectedReviewTypes={selectedReviewTypes}
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
