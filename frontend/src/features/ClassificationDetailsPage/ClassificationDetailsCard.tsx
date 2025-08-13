import React, { useState } from "react";
import ClassCard from "./ClassCard";
import { useRouter } from "next/router";
import { useBooks } from "../../context/BookContext";

interface ClassificationDetailsCardProps {
  onSeeInfo?: () => void;
  onJumpToHighlight?: (className: string, direction: 'next' | 'prev') => void;
}

const getToday = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const ClassificationDetailsCard: React.FC<ClassificationDetailsCardProps> = ({ onSeeInfo, onJumpToHighlight }) => {
  const router = useRouter();
  const { id: bookId } = router.query;
  const { books } = useBooks();

  // Get the current book data
  const currentBook = books.find(book => book._id === bookId);

  const mockClasses = [
    { name: "Maths", count: 12 },
    { name: "AI/CS", count: 8 },
    { name: "Political", count: 15 },
    { name: "Religious", count: 6 },
  ];

  return (
    <div className="w-[370px] bg-white rounded-2xl shadow p-0 mt-8 ml-2 border border-blue-200 border-t-4 border-t-blue-500">
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg text-gray-900">
            Classification Result
          </span>
          <button
            className="text-xs px-3 py-1 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50"
            onClick={onSeeInfo}
          >
            See Info
          </button>
        </div>
        
        <div className="mb-3 text-gray-500 text-xs font-semibold">
          Classes <span className="font-normal">- No of Paragraphs</span>
        </div>
        
        {/* Class Cards */}
        <div className="space-y-3">
          {bookId && typeof bookId === 'string' && mockClasses.map((cls, idx) => (
            <ClassCard
              key={idx}
              className={cls.name}
              count={cls.count}
              bookId={bookId}
              onJumpToHighlight={onJumpToHighlight || (() => {})}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassificationDetailsCard;
