import React from "react";

interface TableRow {
  pageNo: string;
  paragraph: string;
  confidence: string;
  observations: string;
}

interface AnalysisTableProps {
  rows: TableRow[];
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ rows }) => {
  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-sm border-b bg-[#f7f9fc]">
            <th className="py-4 px-6 font-semibold">
              Page No. <span className="inline-block align-middle">↕</span>
            </th>
            <th className="py-4 px-6 font-semibold">Paragraph</th>
            <th className="py-4 px-6 font-semibold">
              Confidence Score{" "}
              <span className="inline-block align-middle">↕</span>
            </th>
            <th className="py-4 px-6 font-semibold">Observations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 1 ? "bg-[#EBEEFF]" : ""}>
              <td className="py-8 px-6 font-semibold text-gray-900 whitespace-nowrap">
                {row.pageNo}
              </td>

              <td className="py-8 px-6 text-gray-700 max-w-[320px] whitespace-normal break-words line-clamp-3">
                {row.paragraph}
              </td>

              <td className="py-8 px-6 text-gray-700 whitespace-nowrap">
                {row.confidence}
              </td>

              <td className="py-8 px-6 text-gray-700 max-w-[320px] whitespace-normal break-words line-clamp-3">
                {row.observations}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysisTable;
