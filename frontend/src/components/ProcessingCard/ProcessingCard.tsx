import React from "react";
import { useBooks } from "../../context/BookContext";

const ProcessingCard: React.FC = () => {
  const { activeClassifications, activeAnalyses } = useBooks();

  const hasAny = activeClassifications.length > 0 || activeAnalyses.length > 0;
  if (!hasAny) {
    return null; // Don't show anything if no active classifications
  }

  return (
    <div className="space-y-4">
      {activeClassifications.map((classification) => {
        // Log for debugging
        console.log(
          "[ProcessingCard] Classification progress:",
          classification
        );
        return (
          <div
            key={classification.book_id}
            className="flex items-center bg-white rounded-xl shadow p-5 min-w-[260px] gap-4"
          >
            {/* Icon placeholder */}
            <span className="w-10 h-10 rounded-full p-2 bg-[#f66e14] flex items-center justify-center mr-2">
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.26245 16.8369C4.26245 13.5549 5.56624 10.4072 7.887 8.08647C10.2078 5.7657 13.3554 4.46191 16.6375 4.46191C20.097 4.47493 23.4176 5.82485 25.905 8.22941L29.0125 11.3369"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M29.0125 4.46191V11.3369H22.1375"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M29.0125 16.8369C29.0125 20.119 27.7087 23.2666 25.3879 25.5874C23.0671 27.9081 19.9195 29.2119 16.6375 29.2119C13.1779 29.1989 9.85728 27.849 7.36995 25.4444L4.26245 22.3369"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.1375 22.3369H4.26245V29.2119"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2 gap-x-2">
                <span className="text-lg font-semibold text-gray-800">
                  Classifying: {classification.book_name || "Unknown Book"}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {classification.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#f66e14] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${classification.progress}%` }}
                ></div>
              </div>
              {/* Show done/total if available */}
              {typeof classification.done === "number" &&
                typeof classification.total === "number" && (
                  <div className="text-xs text-gray-600 font-mono">
                    {classification.done} / {classification.total} chunks
                    processed
                  </div>
                )}
            </div>
          </div>
        );
      })}

      {activeAnalyses.map((analysis) => {
        return (
          <div
            key={`analysis-${analysis.book_id}`}
            className="flex items-center bg-white rounded-xl shadow p-5 min-w-[260px] gap-4"
          >
            <span className="w-10 h-10 rounded-full p-2 bg-[#3b82f6] flex items-center justify-center mr-2">
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 17h26"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M17 4v26"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2 gap-x-2">
                <span className="text-lg font-semibold text-gray-800">
                  Analysing: {analysis.book_name || "Unknown Book"}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {analysis.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${analysis.progress}%` }}
                ></div>
              </div>
              {typeof analysis.done === "number" &&
                typeof analysis.total === "number" && (
                  <div className="text-xs text-gray-600 font-mono">
                    {analysis.done} / {analysis.total} chunks analyzed
                  </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessingCard;
