import React from "react";

const dummyBooks = [
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processing",
    percent: 20,
    startDate: "12 January 2023",
    endDate: null,
    uploadDate: "12 January 2023",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    percent: 100,
    startDate: "12 January 2023",
    endDate: "12 January 2023",
    uploadDate: "12 January 2023",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Assigned",
    percent: 100,
    startDate: "12 January 2023",
    endDate: null,
    uploadDate: "12 January 2023",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Pending",
    percent: 0,
    startDate: "12 January 2023",
    endDate: null,
    uploadDate: "12 January 2023",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    percent: 100,
    startDate: "12 January 2023",
    endDate: "12 January 2023",
    uploadDate: "12 January 2023",
  },
];

const statusStyles: Record<string, { border: string; bar: string; text: string }> = {
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
};

const BookGridView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {dummyBooks.map((book, idx) => {
        const style = statusStyles[book.status] || statusStyles["Processing"];
        return (
          <div
            key={idx}
            className={`relative bg-white rounded-2xl shadow p-6 min-w-[320px] max-w-[380px] mx-auto`}
          >
            {/* Colored top border */}
            <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-2xl ${style.bar}`} />
            {/* Book image placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-28 h-36 bg-gray-100 rounded shadow-inner" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-gray-900">{book.title}</div>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                <span className="text-2xl">&#8942;</span>
              </button>
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
                Date Uploaded: {book.uploadDate}
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <span className={`font-semibold ${style.text}`}>
                {book.status === "Processed"
                  ? "Process Completed"
                  : book.status}
              </span>
              <span className="text-xs text-gray-500 font-bold">{book.percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${style.bar}`}
                style={{ width: `${book.percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookGridView; 