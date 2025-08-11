import React from "react";
import { ReviewOutcomesResponse } from "../../../context/BookContext";

interface AnalysisTableProps {
  data: ReviewOutcomesResponse[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data, currentPage, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const clampedPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedData = data.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const renderBool = (v: unknown) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v ?? "-");

  return (
    <div className="flex flex-col gap-8">
      {reviewTables.map(({ key, title }) => {
        const hasAnyRows = paginatedData.some((row) => !!(row as any)[key]);
        return (
          <div key={String(key)} className="w-full">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
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
                  {hasAnyRows ? (
                    paginatedData.map((row, idx) => {
                      const detail = (row as any)[key];
                      if (!detail) {
                        return (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-[#EBEEFF]" : ""}>
                            <td className="py-6 px-6 text-gray-400" colSpan={7}>-</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx} className={idx % 2 === 1 ? "bg-[#EBEEFF]" : ""}>
                          <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{detail?.confidence ?? "-"}</td>
                          <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{renderBool(detail?.human_review) as React.ReactNode}</td>
                          <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{renderBool(detail?.issue_found) as React.ReactNode}</td>
                          <td className="py-6 px-6 text-gray-700 max-w-[420px] whitespace-normal break-words">{detail?.observation ?? "-"}</td>
                          <td className="py-6 px-6 text-gray-700 max-w-[420px] whitespace-normal break-words">{detail?.problematic_text ?? "-"}</td>
                          <td className="py-6 px-6 text-gray-700 whitespace-normal break-words">{detail?.recommendation ?? "-"}</td>
                          <td className="py-6 px-6 text-gray-700 whitespace-nowrap">{detail?.status ?? "-"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="py-6 px-6 text-gray-400" colSpan={7}>No data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Pagination Controls */}
      <div className="flex justify-end items-center gap-2 p-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(clampedPage - 1)}
          disabled={clampedPage === 1}
        >
          Previous
        </button>
        <span>
          Page {clampedPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(clampedPage + 1)}
          disabled={clampedPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AnalysisTable;
