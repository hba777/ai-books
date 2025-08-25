import React, { useState, useMemo, useEffect, useRef } from "react";
import { ReviewOutcomesResponse } from "../../../context/BookContext";
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye } from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModel";
import PDFViewerDialog from "./PDFViewerDialog";

interface AnalysisTableProps {
  data: ReviewOutcomesResponse[];
  pageSize?: number; // kept for backward compatibility, not used in overall pagination mode
  minConfidence?: number; // filter: minimum confidence inclusive
  onlyHumanReviewed?: boolean; // view switch to consolidated human reviewed
  selectedReviewTypes?: string[]; // which review types (agents) to include
  updateReviewOutcome?: (outcomeId: string, reviewType: string, data: { observation?: string; recommendation?: string }) => Promise<any>;
  deleteReviewOutcome?: (outcomeId: string, reviewType: string) => Promise<any>;
  fetchReviewOutcomes?: () => Promise<void>;
  fileUrl?: string | null; // PDF file URL for viewing
  doc_name?: string | null; // Document name for the PDF
}
interface EditableFields {
  observation: string;
  recommendation: string;
}

// Build review table definitions dynamically from the outcome rows without hardcoding names
const formatKeyToTitle = (rawKey: string): string => {
  const noSuffix = rawKey.endsWith("Review") ? rawKey.slice(0, -6) : rawKey;
  const withSpaces = noSuffix
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  const trimmed = withSpaces.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + (rawKey.endsWith("Review") ? " Review" : "");
};

const deriveReviewTables = (rows: ReviewOutcomesResponse[]): { key: string; title: string }[] => {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      if (v && typeof v === "object") {
        const obj = v as Record<string, unknown>;
        // Heuristics to detect a review block
        if (
          "problematic_text" in obj ||
          "confidence" in obj ||
          "issue_found" in obj ||
          "human_review" in obj
        ) {
          keys.add(k);
        }
      }
    }
  }
  return Array.from(keys).map((key) => ({ key, title: formatKeyToTitle(key) }));
};

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data, minConfidence = 50, onlyHumanReviewed = false, selectedReviewTypes, updateReviewOutcome, deleteReviewOutcome, fetchReviewOutcomes, fileUrl, doc_name }) => {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editableFields, setEditableFields] = useState<Record<string, EditableFields>>({});
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'edit' | 'delete';
    textIndex: number;
    reviewType: string;
    review?: any;
  }>({
    isOpen: false,
    type: 'edit',
    textIndex: 0,
    reviewType: '',
    review: undefined
  });
  const [pdfViewerDialog, setPdfViewerDialog] = useState<{
    isOpen: boolean;
    coordinates?: number[];
    pageNumber?: number;
  }>({
    isOpen: false,
    coordinates: undefined,
    pageNumber: undefined
  });

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
    setConfirmationModal({
      isOpen: true,
      type: 'edit',
      textIndex,
      reviewType
    });
  };

  const confirmSave = async () => {
    const { textIndex, reviewType } = confirmationModal;
    const rowKey = getRowKey(textIndex, reviewType);
    const fields = editableFields[rowKey];
    
    try {
      // Find the review outcome document that contains this review
      const outcomeDoc = data.find(row => {
        const review = (row as any)[reviewType];
        return review && review.problematic_text === groupedData[textIndex]?.problematicText;
      });
      
      if (outcomeDoc?._id) {
        // Type guard for _id
        let idString: string;
  
        if (
          typeof outcomeDoc._id === "object" &&
          outcomeDoc._id !== null &&
          "$oid" in outcomeDoc._id &&
          typeof (outcomeDoc._id as any).$oid === "string"
        ) {
          idString = (outcomeDoc._id as any).$oid;
        } else if (typeof outcomeDoc._id === "string") {
          idString = outcomeDoc._id;
        } else {
          throw new Error("Invalid _id format");
        }
  
        // Call the API to update the review using the string id
        await updateReviewOutcome!(idString, reviewType, {
          observation: fields?.observation,
          recommendation: fields?.recommendation,
        });  
        // Refresh the review outcomes to get updated data
        await fetchReviewOutcomes!();
      }
    } catch (error) {
      console.error("Failed to save review:", error);
      alert("Failed to save changes. Please try again.");
      return;
    }
    
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

    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
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
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      textIndex,
      reviewType
    });
  };

  const confirmDelete = async () => {
    const { textIndex, reviewType } = confirmationModal;
    
    if (!deleteReviewOutcome) {
      alert('Delete functionality not available');
      return;
    }

    try {
      // Find the review outcome document that contains this review
      const outcomeDoc = data.find(row => {
        const review = (row as any)[reviewType];
        return review && review.problematic_text === groupedData[textIndex]?.problematicText;
      });
      
      if (outcomeDoc?._id) {
        // Type guard for _id just like handleSave
        let idString: string;
  
        if (
          typeof outcomeDoc._id === "object" &&
          outcomeDoc._id !== null &&
          "$oid" in outcomeDoc._id &&
          typeof (outcomeDoc._id as any).$oid === "string"
        ) {
          idString = (outcomeDoc._id as any).$oid;
        } else if (typeof outcomeDoc._id === "string") {
          idString = outcomeDoc._id;
        } else {
          throw new Error("Invalid _id format");
        }
  
        // Call the API to delete the specific review type using the string id
        await deleteReviewOutcome(idString, reviewType);
  
        // Refresh the review outcomes to get updated data
        if (fetchReviewOutcomes) {
          await fetchReviewOutcomes();
        }
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
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

  const handleViewInPDF = (textIndex: number, reviewType: string) => {
    // Find the review that contains coordinates for this text
    const review = groupedData[textIndex]?.reviews[reviewType];
    if (review?.coordinates && review.coordinates.length >= 4) {
      // Try to get page number from the review or from the parent document
      let pageNumber = 1;
      if (review.page_number) {
        pageNumber = typeof review.page_number === 'string' ? parseInt(review.page_number) : review.page_number;
      } else {
        // Find the parent document that contains this review
        const parentDoc = data.find(row => {
          const rowReview = (row as any)[reviewType];
          return rowReview && rowReview.problematic_text === groupedData[textIndex]?.problematicText;
        });
        if (parentDoc?.Page_Number) {
          pageNumber = typeof parentDoc.Page_Number === 'string' ? parseInt(parentDoc.Page_Number) : parentDoc.Page_Number;
        }
      }
      
      setPdfViewerDialog({
        isOpen: true,
        coordinates: review.coordinates,
        pageNumber: pageNumber
      });
    } else {
      // If no coordinates, just open the PDF without highlighting
      setPdfViewerDialog({
        isOpen: true,
        coordinates: undefined,
        pageNumber: 1
      });
    }
  };

  // Note: Avoid early returns before all hooks are called; render fallbacks conditionally instead.

  // Build a flat list of human-reviewed items (across all texts and review types), honoring filters
  const humanReviewedItems = useMemo(() => {
    const items: Array<{ key: string; title: string; review: any }> = [];
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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-800">Paragraph {textIndex + 1}:</h4>
              {fileUrl && (
                <button
                  onClick={() => {
                    // Find the first review with coordinates for this text
                    const firstReviewWithCoords = Object.entries(group.reviews).find(([_, review]) => 
                      (review as any)?.coordinates && (review as any).coordinates.length >= 4
                    );
                    if (firstReviewWithCoords) {
                      const [reviewType, review] = firstReviewWithCoords;
                      handleViewInPDF(textIndex, reviewType);
                    } else {
                      // If no coordinates found, open PDF without highlighting
                      setPdfViewerDialog({
                        isOpen: true,
                        coordinates: undefined,
                        pageNumber: 1
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  title="View in PDF"
                >
                  <FaEye size={12} />
                  View in PDF
                </button>
              )}
            </div>
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
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 mb-2">No Review Data Available</p>
            <p className="text-sm text-gray-500">
              {minConfidence > 50 ? 
                `Confidence level too high (${minConfidence}+). Try lowering the confidence filter to see more results.` : 
                'No review data matches the current filters.'
              }
            </p>
          </div>
        </div>
      ))}

      {/* Human Reviewed (Consolidated) */}
      {onlyHumanReviewed && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Human Reviewed (All)</h3>
          {humanReviewedItems.length > 0 ? (
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
          ) : (
            <div className="bg-white rounded-2xl shadow p-6 text-center">
              <div className="text-gray-500 mb-2">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold text-gray-700 mb-2">No Human Reviewed Items Found</p>
                <p className="text-sm text-gray-500">
                  {minConfidence > 50 ? 
                    `Confidence level too high (${minConfidence}+). Try lowering the confidence filter to see more results.` : 
                    'No human reviewed items match the current filters.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paragraph Pagination Controls */}
      {!onlyHumanReviewed && totalParagraphPages > 1 && (
        <div className="flex justify-end items-center gap-2 p-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => {
              setParagraphPage(clampedParagraphPage - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={clampedParagraphPage === 1}
          >
            Previous
          </button>
          <span>
            Page {clampedParagraphPage} of {totalParagraphPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer"
            onClick={() => {
              setParagraphPage(clampedParagraphPage + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={clampedParagraphPage === totalParagraphPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.type === 'edit' ? confirmSave : confirmDelete}
        title={confirmationModal.type === 'edit' ? 'Confirm Save' : 'Confirm Delete'}
        message={
          confirmationModal.type === 'edit' 
            ? `Are you sure you want to save the changes to this ${confirmationModal.reviewType} review?`
            : `Are you sure you want to delete this ${confirmationModal.reviewType} review? This action cannot be undone.`
        }
        confirmText={confirmationModal.type === 'edit' ? 'Save' : 'Delete'}
        cancelText="Cancel"
        type={confirmationModal.type}
      />

      {/* PDF Viewer Dialog */}
      <PDFViewerDialog
        isOpen={pdfViewerDialog.isOpen}
        onClose={() => setPdfViewerDialog(prev => ({ ...prev, isOpen: false }))}
        fileUrl={fileUrl}
        doc_name={doc_name ? doc_name : 'Document'}
        coordinates={pdfViewerDialog.coordinates}
        pageNumber={pdfViewerDialog.pageNumber}
      />
    </div>
  );
};

export default AnalysisTable;