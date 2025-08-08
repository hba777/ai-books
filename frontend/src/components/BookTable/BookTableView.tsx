import React, { useState } from "react";
import { useRouter } from "next/router";
import { useBooks } from "../../context/BookContext";
import { toast } from "react-toastify"
import { useClassificationContext } from '../../features/ClassificationPage/ClassificationCardRow/ClassificationContext';
interface Book {
  _id: string;
  doc_name: string;
  author: string;
  date: string;
  category: string;
  reference: string;
  status: string;
  summary: string;
  labels?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface BookTableViewProps {
  filteredBooks: Book[];
  statusColors: { [key: string]: string };
}

const BookTableView: React.FC<BookTableViewProps> = ({
  filteredBooks,
  statusColors,
}) => {
  const router = useRouter();
  const {indexBook, startClassification } = useBooks();
  const { isAnyBookProcessing } = useClassificationContext();

  const handleRowClick = (id: string) => {
    const basePath = router.pathname.startsWith("/analysis")
      ? "/analysis"
      : "/classification";
    router.push(`${basePath}/${id}`);
  };

  const handleStartClassification = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent triggering the row click
    
    try {
      await startClassification(bookId);
      toast.success("Classification Started")
    } catch (error) {
      console.error('Error starting classification:', error);
      toast.error("Classification Failed")
    } finally {
      // setProcessingBooks(prev => { // This line is removed as per the edit hint
      //   const newSet = new Set(prev);
      //   newSet.delete(bookId);
      //   return newSet;
      // });
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-sm border-b">
            <th className="flex py-4 px-6 font-semibold">
              Name
              <svg
                className="mt-1"
                width="25"
                height="17"
                viewBox="0 0 25 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_50_13170)">
                  <path
                    d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.8484 13.4967V2.83008"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.1819 2.83008V13.4967"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_50_13170">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(8.51514 0.163391)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </th>
            <th className="py-4 px-6 font-semibold">Author</th>
            <th className="flex py-4 px-6 font-semibold">
              Status
              <svg
                className="mt-1"
                width="25"
                height="17"
                viewBox="0 0 25 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_50_13170)">
                  <path
                    d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.8484 13.4967V2.83008"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.1819 2.83008V13.4967"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_50_13170">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(8.51514 0.163391)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </th>
            <th className="py-4 px-6 font-semibold">Date Submitted</th>
            <th className="py-4 px-6 font-semibold">Labels (If Classified)</th>
            <th className="py-4 px-6 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr
              key={book._id}
              className="hover:bg-blue-50/60 transition cursor-pointer"
              onClick={() => handleRowClick(book._id)}
            >
              <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                {book.doc_name}
              </td>
              <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                {book.author}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[book.status] ||
                    "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                >
                  {book.status}
                </span>
              </td>
              <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                {book.date}
              </td>
              <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                {book.labels && book.labels.length > 0 ? (
                  book.labels.includes("NIL") ? (
                    <span className="text-gray-700 font-bold">-- NIL --</span>
                  ) : (
                    book.labels.join(", ")
                  )
                ) : (
                  <span className="text-gray-700 font-bold">-- NIL --</span>
                )}
              </td>
              <td>
                <button
                  title="Index"
                  onClick={e => {
                    e.stopPropagation();
                    indexBook(book._id);
                    toast.success("Chunking Started")
                  }}
                  disabled={isAnyBookProcessing || book.status === "Pending"}
                  className={`p-2 rounded ${
                    isAnyBookProcessing || book.status === "Pending"
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-blue-100'
                  }`}
                >
                  {/* Use any icon you like */}
                  <svg width="20" height="20" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </td>
              <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                <button
                  onClick={(e) => handleStartClassification(e, book._id)}
                  disabled={isAnyBookProcessing || book.status !== "Pending"}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    isAnyBookProcessing || book.status !== "Pending"
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {book.status === "Pending"
                    ? "Start Classification"
                    : book.status === "Processing"
                      ? "Processing..."
                      : book.status === "Indexing"
                        ? "Indexing..."
                        : "Not Available"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTableView;
