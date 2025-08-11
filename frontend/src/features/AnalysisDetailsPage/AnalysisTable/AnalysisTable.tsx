import React, { useState, useMemo, useEffect, useRef } from "react";
import { ReviewOutcomesResponse } from "../../../context/BookContext";

interface AnalysisTableProps {
  data: ReviewOutcomesResponse[];
  pageSize?: number; // kept for backward compatibility, not used in overall pagination mode
}

const reviewTables: { key: keyof ReviewOutcomesResponse; title: string }[] = [
  { key: "FactCheckingReview", title: "Fact Checking Review" },
  { key: "FederalUnityReview", title: "Federal Unity Review" },
  { key: "ForeignRelationsReview", title: "Foreign Relations Review" },
  { key: "HistoricalNarrativeReview", title: "Historical Narrative Review" },
  { key: "InstitutionalIntegrityReview", title: "Institutional Integrity Review" },
  { key: "NationalSecurityReview", title: "National Security Review" },
  { key: "RhetoricToneReview", title: "Rhetoric & Tone Review" },
];

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data }) => {
  // Build list of review types that actually have rows
  const availableTables = useMemo(() => {
    return reviewTables.filter(({ key }) => data.some((row) => !!(row as any)[key]));
  }, [data]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(availableTables.length, 1);
  const clampedPage = Math.min(Math.max(currentPage, 1), totalPages);

  const currentTable = availableTables[clampedPage - 1];
  const currentRows = currentTable ? data.filter((row) => !!(row as any)[currentTable.key]) : [];

  const tableTopRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Smoothly scroll the table container into view on page change
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [clampedPage]);

  const renderBool = (v: unknown): React.ReactNode => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (v === null || v === undefined) return "-";
    return String(v);
  };

  if (availableTables.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-gray-500">No review data available.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full" ref={tableTopRef}>
        <h3 className="text-lg font-semibold mb-3">{currentTable.title}</h3>
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-[1000px] text-left">
            <thead>
              <tr className="text-sm border-b bg-[#f7f9fc]">
                <th className="py-4 px-6 font-semibold">Confidence</th>
                <th className="py-4 px-6 font-semibold">Human Review</th>
                <th className="py-4 px-6 font-semibold">Issue Found</th>
                <th className="py-4 px-6 font-semibold">Observation</th>
                <th className="py-4 px-6 font-semibold">Problematic Text</th>
                <th className="py-4 px-6 font-semibold">Recommendation</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => {
                const detail = (row as any)[currentTable.key];
                return (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-[#EBEEFF]" : ""}>
                    <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{detail?.confidence ?? "-"}</td>
                    <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{renderBool(detail?.human_review)}</td>
                    <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{renderBool(detail?.issue_found)}</td>
                    <td className="py-6 px-6 text-gray-700 max-w-[420px] whitespace-normal break-words">{detail?.observation ?? "-"}</td>
                    <td className="py-6 px-6 text-gray-700 max-w-[420px] whitespace-normal break-words">{detail?.problematic_text ?? "-"}</td>
                    <td className="py-6 px-6 text-gray-700 whitespace-normal break-words">{detail?.recommendation ?? "-"}</td>
                    <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{detail?.status ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall Pagination Controls (paginate across tables) */}
      <div className="flex justify-end items-center gap-2 p-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
          onClick={() => setCurrentPage(clampedPage - 1)}
          disabled={clampedPage === 1}
        >
          Previous
        </button>
        <span>
          Page {clampedPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
          onClick={() => setCurrentPage(clampedPage + 1)}
          disabled={clampedPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AnalysisTable;
