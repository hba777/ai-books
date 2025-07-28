import React from "react";
import { Book } from "../../services/booksApi";

interface SeeInfoProps {
  onClose?: () => void;
  book: Book;
}

const SeeInfo: React.FC<SeeInfoProps> = ({ onClose, book }) => {
  // Format dates for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format labels for display
  const formatLabels = (labels: string[] | null | undefined) => {
    if (!labels || labels.length === 0) return "No labels assigned";
    return labels.join(", ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl relative border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-6">Book Information</h2>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Book Title</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={book.doc_name}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Author Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={book.author}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Date Submitted</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={formatDate(book.date)}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Start Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={formatDate(book.startDate)}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">End Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={formatDate(book.endDate)}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">General Category</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={book.category}
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Classification Labels</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value={formatLabels(book.labels)}
              readOnly
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-1">Abstract</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
            placeholder="Max 200 words"
            rows={3}
            value={book.summary}
            readOnly
          />
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition">
            Edit Book Info
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        )}
      </div>
    </div>
  );
};

export default SeeInfo;
