import React, { useState, useMemo, useEffect, useRef } from "react";
import { ReviewOutcomesResponse } from "../../../context/BookContext";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { reviewTypeOptions, ReviewTypeKey } from "../constants";

interface AnalysisTableProps {
  data: ReviewOutcomesResponse[];
  pageSize?: number; // kept for backward compatibility, not used in overall pagination mode
  minConfidence?: number; // filter: minimum confidence inclusive
  onlyHumanReviewed?: boolean; // view switch to consolidated human reviewed
  selectedReviewTypes?: string[]; // which review types (agents) to include
}

interface EditableFields {
  observation: string;
  recommendation: string;
}

// Build review table definitions dynamically from the shape of the data at runtime
const deriveReviewTables = (rows: ReviewOutcomesResponse[]): { key: keyof ReviewOutcomesResponse; title: string }[] => {
  const candidateKeys: Array<keyof ReviewOutcomesResponse> = [
    "FactCheckingReview",
    "FederalUnityReview",
    "ForeignRelationsReview",
    "HistoricalNarrativeReview",
    "InstitutionalIntegrityReview",
    "NationalSecurityReview",
    "RhetoricToneReview",
  ];
  const present = new Set<keyof ReviewOutcomesResponse>();
  for (const row of rows) {
    for (const k of candidateKeys) {
      if ((row as any)[k]) present.add(k);
    }
  }
  const keyToTitle: Record<string, string> = {
    FactCheckingReview: "Fact Checking Review",
    FederalUnityReview: "Federal Unity Review",
    ForeignRelationsReview: "Foreign Relations Review",
    HistoricalNarrativeReview: "Historical Narrative Review",
    InstitutionalIntegrityReview: "Institutional Integrity Review",
    NationalSecurityReview: "National Security Review",
    RhetoricToneReview: "Rhetoric & Tone Review",
  };
  return Array.from(present).map((key) => ({ key, title: keyToTitle[String(key)] ?? String(key) }));
};

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data, minConfidence = 50, onlyHumanReviewed = false, selectedReviewTypes }) => {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editableFields, setEditableFields] = useState<Record<string, EditableFields>>({});

  // Get unique problematic texts and group reviews by text
  const reviewTables = useMemo(() => deriveReviewTables(data), [data]);

  const groupedData = useMemo(() => {
    const textGroups: Record<string, any> = {};
    
    data.forEach((row) => {
      reviewTables.forEach(({ key, title }) => {
        if (selectedReviewTypes && selectedReviewTypes.length > 0 && !selectedReviewTypes.includes(String(key))) {
          return;
        }
        const review = (row as any)[key];
        if (review && review.problematic_text) {
          const text = review.problematic_text;
          if (!textGroups[text]) {
            textGroups[text] = {
              problematicText: text,
              reviews: {}
            };
          }
          textGroups[text].reviews[key] = review;
        }
      });
    });
    
    return Object.values(textGroups);
  }, [data, selectedReviewTypes, reviewTables]);

  const renderBool = (v: unknown): React.ReactNode => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (v === null || v === undefined) return "-";
    return String(v);
  };

  const getRowKey = (textIndex: number, reviewType: string) => `${textIndex}-${reviewType}`;

  const handleEdit = (textIndex: number, reviewType: string, review: any) => {
    const rowKey = getRowKey(textIndex, reviewType);
    setEditingRows(prev => new Set(prev).add(rowKey));
    setEditableFields(prev => ({
      ...prev,
      [rowKey]: {
        observation: review?.observation || "",
        recommendation: review?.recommendation || ""
      }
    }));
  };

  const handleSave = (textIndex: number, reviewType: string) => {
    const rowKey = getRowKey(textIndex, reviewType);
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowKey);
      return newSet;
    });
    
    // Here you would typically save the updated data to your backend
    console.log('Saving data for:', rowKey, editableFields[rowKey]);
    
    // Clear the editable fields
    setEditableFields(prev => {
      const newFields = { ...prev };
      delete newFields[rowKey];
      return newFields;
    });
  };

  const handleCancel = (textIndex: number, reviewType: string) => {
    const rowKey = getRowKey(textIndex, reviewType);
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowKey);
      return newSet;
    });
    
    // Clear the editable fields
    setEditableFields(prev => {
      const newFields = { ...prev };
      delete newFields[rowKey];
      return newFields;
    });
  };

  const handleDelete = (textIndex: number, reviewType: string) => {
    // Here you would typically delete the review from your backend
    console.log('Deleting review:', reviewType, 'for text index:', textIndex);
    alert(`Delete functionality for ${reviewType} would be implemented here`);
  };

  const handleFieldChange = (rowKey: string, field: keyof EditableFields, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [field]: value
      }
    }));
  };

  // Note: Avoid early returns before all hooks are called; render fallbacks conditionally instead.

  // Build a flat list of human-reviewed items (across all texts and review types), honoring filters
  const humanReviewedItems = useMemo(() => {
    const items: Array<{ key: keyof ReviewOutcomesResponse; title: string; review: any }> = [];
    data.forEach((row) => {
      reviewTables.forEach(({ key, title }) => {
        if (selectedReviewTypes && selectedReviewTypes.length > 0 && !selectedReviewTypes.includes(String(key))) return;
        const review = (row as any)[key];
        if (!review) return;
        // Must be human reviewed
        if (!review.human_review) return;
        // Respect issue_found rule from current table (show only issues)
        if (!review.issue_found) return;
        // Confidence filter
        const numericConfidence = typeof review.confidence === 'number' ? review.confidence : Number(review.confidence);
        if (!Number.isFinite(numericConfidence) || numericConfidence < minConfidence) return;
        items.push({ key, title, review });
      });
    });
    return items;
  }, [data, minConfidence, selectedReviewTypes, reviewTables]);

  // Pagination for paragraph tables (10 paragraphs per page)
  const PARAGRAPHS_PER_PAGE = 10;
  const totalParagraphPages = Math.max(Math.ceil(groupedData.length / PARAGRAPHS_PER_PAGE), 1);
  const [paragraphPage, setParagraphPage] = useState<number>(1);
  const clampedParagraphPage = Math.min(Math.max(paragraphPage, 1), totalParagraphPages);
  useEffect(() => {
    if (paragraphPage !== clampedParagraphPage) setParagraphPage(clampedParagraphPage);
  }, [clampedParagraphPage]);

  const startIdx = (clampedParagraphPage - 1) * PARAGRAPHS_PER_PAGE;
  const endIdx = startIdx + PARAGRAPHS_PER_PAGE;
  const visibleParagraphGroups = groupedData.slice(startIdx, endIdx);

  return (
    <div className="flex flex-col gap-4">
      {!onlyHumanReviewed && (
        visibleParagraphGroups.length > 0 ? visibleParagraphGroups.map((group, relIndex) => {
        const textIndex = startIdx + relIndex;
        return (
        <div key={textIndex} className="w-full">
          {/* Problematic Text Header */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Paragraph {textIndex + 1}:</h4>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 whitespace-normal break-words">
                {group.problematicText}
              </p>
            </div>
          </div>

          {/* Review Table */}
          <div className="rounded-2xl shadow">
            <table className="min-w-[1000px] text-left bg-white w-full">
              <thead>
                <tr className="text-sm border-b bg-[#f7f9fc]">
                  <th className="py-4 px-6 font-semibold text-left">Review Type</th>
                  <th className="py-4 px-6 font-semibold text-center">Confidence</th>
                  <th className="py-4 px-6 font-semibold text-center">Human Review</th>
                  <th className="py-4 px-6 font-semibold text-center">Observation</th>
                  <th className="py-4 px-6 font-semibold text-center">Recommendation</th>
                  <th className="py-4 px-6 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewTables.map(({ key, title }) => {
                  const review = group.reviews[key];
                  const rowKey = getRowKey(textIndex, String(key));
                  const isEditing = editingRows.has(rowKey);
                  const currentEditableFields = editableFields[rowKey] || { observation: "", recommendation: "" };

                  // Skip reviews that don't have data or fail filters
                  if (!review || !review.issue_found) {
                    return null;
                  }

                  // Apply confidence filter (inclusive). If confidence is not a number, skip.
                  const numericConfidence = typeof review.confidence === 'number' ? review.confidence : Number(review.confidence);
                  if (!Number.isFinite(numericConfidence) || numericConfidence < minConfidence) {
                    return null;
                  }

                  // Apply human review filter when enabled
                  if (onlyHumanReviewed && !review.human_review) {
                    return null;
                  }

                  return (
                    <tr key={String(key)} className="border-b hover:bg-gray-50">
                      {/* Review Type */}
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {title}
                      </td>
                      
                      
                      {/* Confidence */}
                      <td className="py-4 px-6 text-center font-semibold">
                        {review.confidence || "-"}
                      </td>
                      
                      {/* Human Review */}
                      <td className="py-4 px-6 text-center font-semibold">
                        {renderBool(review.human_review)}
                      </td>
                      
                      
                      {/* Observation */}
                      <td className="py-4 px-6 text-center">
                        {isEditing ? (
                          <textarea
                            value={currentEditableFields.observation}
                            onChange={(e) => handleFieldChange(rowKey, 'observation', e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={4}
                            placeholder="Enter observation..."
                          />
                        ) : (
                          <div className="max-w-[200px] whitespace-normal break-words text-sm">
                            {review.observation || "-"}
                          </div>
                        )}
                      </td>
                      
                      {/* Recommendation */}
                      <td className="py-4 px-6 text-center">
                        {isEditing ? (
                          <textarea
                            value={currentEditableFields.recommendation}
                            onChange={(e) => handleFieldChange(rowKey, 'recommendation', e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={4}
                            placeholder="Enter recommendation..."
                          />
                        ) : (
                          <div className="max-w-[200px] whitespace-normal break-words text-sm">
                            {review.recommendation || "-"}
                          </div>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(textIndex, key)}
                                className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                title="Save"
                              >
                                <FaSave size={14} />
                              </button>
                              <button
                                onClick={() => handleCancel(textIndex, key)}
                                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                title="Cancel"
                              >
                                <FaTimes size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(textIndex, key, review)}
                                className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(textIndex, key)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <FaTrash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );}) : (
        <div className="bg-white rounded-2xl shadow p-6 text-gray-500">No review data available.</div>
      ))}

      {/* Human Reviewed (Consolidated) */}
      {onlyHumanReviewed && humanReviewedItems.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Human Reviewed (All)</h3>
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="min-w-[1000px] text-left">
              <thead>
                <tr className="text-sm border-b bg-[#f7f9fc]">
                  <th className="py-4 px-6 font-semibold text-left">Review Type</th>
                  <th className="py-4 px-6 font-semibold text-center">Confidence</th>
                  <th className="py-4 px-6 font-semibold text-center">Observation</th>
                  <th className="py-4 px-6 font-semibold text-center">Recommendation</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {humanReviewedItems.map(({ key, title, review }, idx) => {
                  const rowKey = getRowKey(100000 + idx, `human-${String(key)}`);
                  const isEditing = editingRows.has(rowKey);
                  const currentEditableFields = editableFields[rowKey] || { observation: "", recommendation: "" };

                  const analyzedText = review.problematic_text || "-";

                  return (
                    <React.Fragment key={`${String(key)}-${idx}`}>
                      {/* Dotted analyzed text row */}
                      <tr>
                        <td colSpan={6} className="px-6 pt-4">
                          <div className="border-2 border-dotted border-gray-300 bg-gray-50 rounded-md p-3 text-sm text-gray-700 whitespace-normal break-words">
                            Paragraph: {analyzedText}
                          </div>
                        </td>
                      </tr>
                      {/* Data row */}
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-700 font-medium">{title}</td>
                        <td className="py-4 px-6 text-center font-semibold">{review.confidence ?? '-'}</td>
                        <td className="py-4 px-6 text-center">
                          {isEditing ? (
                            <textarea
                              value={currentEditableFields.observation}
                              onChange={(e) => setEditableFields(prev => ({ ...prev, [rowKey]: { ...prev[rowKey], observation: e.target.value } }))}
                              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={4}
                              placeholder="Enter observation..."
                            />
                          ) : (
                            <div className="max-w-[260px] whitespace-normal break-words text-sm">{review.observation || '-'}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isEditing ? (
                            <textarea
                              value={currentEditableFields.recommendation}
                              onChange={(e) => setEditableFields(prev => ({ ...prev, [rowKey]: { ...prev[rowKey], recommendation: e.target.value } }))}
                              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={4}
                              placeholder="Enter recommendation..."
                            />
                          ) : (
                            <div className="max-w-[260px] whitespace-normal break-words text-sm">{review.recommendation || '-'}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center font-semibold">{review.status || '-'}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    // reuse save/cancel paths with unique key
                                    const keyPart = `human-${String(key)}`;
                                    const textIndex = 100000 + idx;
                                    const saveRowKey = getRowKey(textIndex, keyPart);
                                    setEditingRows(prev => { const ns = new Set(prev); ns.delete(saveRowKey); return ns; });
                                    setEditableFields(prev => { const nf = { ...prev }; delete nf[saveRowKey]; return nf; });
                                  }}
                                  className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                  title="Save"
                                >
                                  <FaSave size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    const keyPart = `human-${String(key)}`;
                                    const textIndex = 100000 + idx;
                                    const cancelRowKey = getRowKey(textIndex, keyPart);
                                    setEditingRows(prev => { const ns = new Set(prev); ns.delete(cancelRowKey); return ns; });
                                    setEditableFields(prev => { const nf = { ...prev }; delete nf[cancelRowKey]; return nf; });
                                  }}
                                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                  title="Cancel"
                                >
                                  <FaTimes size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    const keyPart = `human-${String(key)}`;
                                    const textIndex = 100000 + idx;
                                    const rowKeyLocal = getRowKey(textIndex, keyPart);
                                    setEditingRows(prev => new Set(prev).add(rowKeyLocal));
                                    setEditableFields(prev => ({
                                      ...prev,
                                      [rowKeyLocal]: {
                                        observation: review?.observation || "",
                                        recommendation: review?.recommendation || "",
                                      },
                                    }));
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    // delete action placeholder
                                    console.log('Deleting human reviewed row');
                                  }}
                                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paragraph Pagination Controls */}
      {!onlyHumanReviewed && totalParagraphPages > 1 && (
        <div className="flex justify-end items-center gap-2 p-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => setParagraphPage(clampedParagraphPage - 1)}
            disabled={clampedParagraphPage === 1}
          >
            Previous
          </button>
          <span>
            Page {clampedParagraphPage} of {totalParagraphPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => setParagraphPage(clampedParagraphPage + 1)}
            disabled={clampedParagraphPage === totalParagraphPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisTable;