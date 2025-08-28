import React, { useState } from "react";
import { useRouter } from "next/router";
import { useBooks } from "../../context/BookContext";
import { toast } from "react-toastify";
import { useClassificationContext } from "../../features/ClassificationPage/ClassificationCardRow/ClassificationContext";
import AgentsSideBar from "../../features/ClassificationPage/AgentsSideBar.";
import ChunkSizeConfig from "../ChunkSizeConfig/ChunkSizeConfig";

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
  percent?: number;
}

interface BookGridViewProps {
  books: Book[];
}

const statusStyles: Record<
  string,
  { border: string; bar: string; text: string }
> = {
  Unprocessed: {
    border: "border-gray-400",
    bar: "bg-gray-500",
    text: "text-gray-600",
  },
  Processing: {
    border: "border-blue-400",
    bar: "bg-blue-500",
    text: "text-blue-600",
  },
  Processed: {
    border: "border-green-500",
    bar: "bg-green-500",
    text: "text-green-600",
  },
  Assigned: {
    border: "border-purple-400",
    bar: "bg-purple-500",
    text: "text-purple-600",
  },
  Pending: {
    border: "border-orange-400",
    bar: "bg-orange-500",
    text: "text-orange-600",
  },
  Classified: {
    border: "border-indigo-400",
    bar: "bg-indigo-500",
    text: "text-indigo-600",
  },
  Analyzed: {
    border: "border-teal-400",
    bar: "bg-teal-500",
    text: "text-teal-600",
  },
};

const BookGridView: React.FC<BookGridViewProps> = ({ books }) => {
  const router = useRouter();
  const { indexBook } = useBooks();
  const { isAnyBookProcessing } = useClassificationContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarBookId, setSidebarBookId] = useState<string | null>(null);
  const [chunkConfigOpen, setChunkConfigOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const handleBookClick = (id: string) => {
    const basePath = router.pathname.startsWith("/analysis")
      ? "/analysis"
      : "/classification";
    router.push(`${basePath}/${id}`);
  };

  const openSidebarForBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    setSidebarBookId(bookId);
    setSidebarOpen(true);
  };

  const handleIndexClick = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    setSelectedBookId(bookId);
    setChunkConfigOpen(true);
  };

  const handleChunkSizeConfirm = (chunkSize: number) => {
    if (selectedBookId) {
      indexBook(selectedBookId, chunkSize);
      toast.success("Indexing Started");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {books.map((book, idx) => {
        const style = statusStyles[book.status] || statusStyles["Processing"];
        // Calculate percent if not present
        const percent =
          typeof book.percent === "number"
            ? book.percent
            : book.status === "Processed"
            ? 100
            : book.status === "Processing"
            ? 50
            : book.status === "Classified"
            ? 70
            : book.status === "Analyzed"
            ? 70
            : book.status === "Assigned"
            ? 100
            : book.status === "Pending"
            ? 0
            : 0;
        return (
          <div
            key={book._id}
            onClick={() => handleBookClick(book._id)}
            className={`relative bg-white rounded-2xl shadow p-6 min-w-[320px] max-w-[380px] mx-auto cursor-pointer`}
          >
            {/* Colored top border */}
            <div
              className={`absolute top-0 left-0 w-full h-1.5 rounded-t-2xl ${style.bar}`}
            />
            {/* Book image placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-28 h-36 bg-gray-100 rounded shadow-inner" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-gray-900">
                {book.doc_name}
              </div>
              <div className="flex items:center gap-2">
                {" "}
                <button
                  onClick={(e) => openSidebarForBook(e, book._id)}
                  disabled={(() => {
                    const canOpen = !isAnyBookProcessing && (book.status === "Pending" || book.status === "Classified" || book.status === "Analyzed");
                    return !canOpen;
                  })()}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${(() => {
                    const canOpen = (!isAnyBookProcessing && (book.status === "Pending" || book.status === "Classified" || book.status === "Analyzed"));
                    return canOpen
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed";
                  })()}`}
                >
                  {book.status === "Pending" || book.status === "Classified" || book.status === "Analyzed"
                    ? "Start Processing"
                    : book.status === "Processing"
                    ? "Processing..."
                    : book.status === "Indexing"
                    ? "Indexing..."
                    : book.status === "Processed" || book.status === "Assigned"
                    ? "Processed"
                    : "Not Available"}
                </button>
                {/* <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                  <span className="text-2xl">&#8942;</span>
                </button> */}
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">
              Start Process Date: {book.startDate}
            </div>
            {book.endDate ? (
              <div className="text-sm text-gray-500 mb-4">
                End Process Date: {book.endDate}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-4">
                Date Uploaded: {book.date}
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <span className={`font-semibold ${style.text}`}>
                {book.status === "Processed"
                  ? "Process Completed"
                  : book.status}
              </span>
              <span className="text-xs text-gray-500 font-bold">
                {percent}%
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-gray-900">
                {book.doc_name}
              </div>
              {book.status === "Unprocessed" && (
                <button
                  title="Index"
                  onClick={(e) => handleIndexClick(e, book._id)}
                  disabled={isAnyBookProcessing}
                  className={`p-1 rounded-full ${
                    isAnyBookProcessing
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-500 hover:text-blue-700"
                  }`}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor">
                    <path
                      d="M5 13l4 4L19 7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${style.bar}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Sidebar */}
      <AgentsSideBar
        open={sidebarOpen}
        bookId={sidebarBookId || ""}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Chunk Size Config Popup */}
      <ChunkSizeConfig
        isOpen={chunkConfigOpen}
        onClose={() => setChunkConfigOpen(false)}
        onConfirm={handleChunkSizeConfirm}
      />
    </div>
  );
};

export default BookGridView;
