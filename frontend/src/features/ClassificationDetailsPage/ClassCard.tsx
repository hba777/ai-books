import React, { useEffect, useMemo, useState, useRef } from "react";
import { useBooks } from "../../context/BookContext";
import { toast } from "react-toastify";
import Image from "next/image";
import { ClassificationEntry } from "../../services/booksApi";

interface ClassCardProps {
  className: string;
  count: number;
  entries: ClassificationEntry[];
  bookId: string;
  onJumpToHighlight: (pageNumber: string, direction: "next" | "prev", coordinates?: number[]) => void;
}

interface FeedbackItem {
  user_id: string;
  username: string;
  department: string;
  comment?: string;
  image_url?: string;
  timestamp: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  className,
  entries,
  bookId,
  onJumpToHighlight,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [minConfidence, setMinConfidence] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackImage, setFeedbackImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClassificationIndex, setSelectedClassificationIndex] =
    useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadingImageUrls, setLoadingImageUrls] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    books,
    addFeedback,
    assignSingleDepartment,
    removeClassificationFromChunk,
    updateClassificationFilter,
  } = useBooks();

  // Get current book data
  const currentBook = books.find((book) => book._id === bookId);
  const feedback = currentBook?.feedback || [];
  const assignedDepartments = currentBook?.assigned_departments || [];

  // Filter feedback for this class
  const classFeedback = feedback.filter(
    (item: FeedbackItem) => item.department === className
  );

  // State for filtered entries
  const [filteredEntries, setFilteredEntries] = useState(() => {
    if (minConfidence == null) return entries;
    return entries.filter((e) => (e.confidence_score ?? 0) >= minConfidence);
  });

  // Keep filteredEntries updated when entries or minConfidence changes
  useEffect(() => {
    if (minConfidence == null) {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(
        entries.filter((e) => (e.confidence_score ?? 0) >= minConfidence)
      );
    }
  }, [entries, minConfidence]);

  // Initialize minConfidence from saved book filters (classificationFilters)
  useEffect(() => {
    const saved = currentBook?.filters?.classificationFilters?.find(
      (f: any) => f?.name === className
    );
    if (saved && typeof saved.value === "number") {
      setMinConfidence(saved.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBook?._id, className]);

  const handleAssignDepartment = async () => {
    setIsSubmitting(true);
    try {
      await assignSingleDepartment(bookId, className);
      toast.success(`${className} department assigned successfully!`);
      setShowAssignModal(false);
    } catch (error) {
      toast.error("Failed to assign department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsImageLoading(true);
      setFeedbackImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setIsImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim() && !feedbackImage) {
      toast.error("Please provide either a comment or an image");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageBase64 = undefined;
      if (feedbackImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(feedbackImage);
        });
      }

      await addFeedback(
        bookId,
        className,
        feedbackComment.trim() || undefined,
        imageBase64
      );

      setFeedbackComment("");
      setFeedbackImage(null);
      setImagePreview(null);
      setShowFeedbackForm(false);
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFeedbackImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteClassification = async () => {
    setIsDeleting(true);
    try {
      // Get the selected classification entry
      const selectedEntry = filteredEntries[selectedClassificationIndex];

      if (!selectedEntry || !selectedEntry.chunk_id) {
        toast.error("No valid classification selected for deletion");
        return;
      }

      // Remove only the selected classification instance from backend
      await removeClassificationFromChunk(selectedEntry.chunk_id, className);

      // Update local state: remove the deleted entry from filteredEntries
      setFilteredEntries((prev) =>
        prev.filter((_, idx) => idx !== selectedClassificationIndex)
      );

      toast.success(`Classification '${className}' removed successfully!`);
      setShowDeleteModal(false);

      // Adjust selected index if needed
      const newIndex = selectedClassificationIndex >= filteredEntries.length - 1 ? 0 : selectedClassificationIndex;
      setSelectedClassificationIndex(newIndex);

      // Jump to the next instance's coordinates if available
      const remainingEntries = filteredEntries.filter((_, idx) => idx !== selectedClassificationIndex);
      if (remainingEntries.length > 0) {
        // Call handleNavigateClassification to jump to next instance
        handleNavigateClassification("next");
      }
    } catch (error) {
      toast.error("Failed to remove classification");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateClassification = (direction: "next" | "prev") => {
    if (filteredEntries.length === 0) return;

    let newIndex: number;
    if (direction === "next") {
      newIndex = selectedClassificationIndex >= filteredEntries.length - 1 ? 0 : selectedClassificationIndex + 1;
    } else {
      newIndex = selectedClassificationIndex <= 0 ? filteredEntries.length - 1 : selectedClassificationIndex - 1;
    }
    
    setSelectedClassificationIndex(newIndex);
    
    // Get the selected entry and jump to its coordinates if available
    const selectedEntry = filteredEntries[newIndex];
    if (selectedEntry?.coordinates && selectedEntry?.page_number) {
      console.log(selectedEntry.chunk_id)

      // Call the parent's onJumpToHighlight with the specific entry data
      onJumpToHighlight(selectedEntry.page_number.toString(), direction, selectedEntry.coordinates);
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadingImageUrls(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  };

  const handleImageError = (imageUrl: string) => {
    setLoadingImageUrls(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
  };

  const addImageToLoading = (imageUrl: string) => {
    setLoadingImageUrls(prev => new Set(prev).add(imageUrl));
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-3">
      {/* Class Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="flex-1 text-gray-700 font-semibold text-sm">
          {className}
        </span>
        <div className="flex items-center gap-2 p-1">
          <div className="text-sm bg-white text-gray-600 px-3 py-1 flex items-center justify-center rounded">
            Count: {selectedClassificationIndex + 1}/{filteredEntries.length}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-lg ml-1"
          onClick={() => handleNavigateClassification("prev")}
          title={`Previous ${className} instance`}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.28042 1.79872C5.19625 1.79806 5.11182 1.83021 5.04721 1.89499L3.05922 3.88814C2.92967 4.01803 2.92808 4.2296 3.05566 4.36149L5.01338 6.38546C5.14095 6.51736 5.34876 6.51898 5.47831 6.38909C5.60786 6.25921 5.60946 6.04764 5.48188 5.91574L3.75485 4.13026L5.50858 2.37197C5.63813 2.24208 5.63973 2.03051 5.51215 1.89862C5.44852 1.83284 5.3646 1.79938 5.28042 1.79872Z"
              fill="white"
            />
          </svg>
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-lg ml-1"
          onClick={() => handleNavigateClassification("next")}
          title={`Next ${className} instance`}
        >
          <svg
            width="11"
            height="12"
            viewBox="0 0 11 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.88438 8.92041C3.99381 8.92041 4.10324 8.87729 4.1866 8.79148L6.75136 6.15132C6.91849 5.97927 6.91849 5.70117 6.75136 5.52912L4.1866 2.88896C4.01946 2.71691 3.74931 2.71691 3.58217 2.88896C3.41503 3.06101 3.41503 3.3391 3.58217 3.51115L5.84471 5.84022L3.58217 8.16928C3.41503 8.34133 3.41503 8.61943 3.58217 8.79148C3.66552 8.87729 3.77495 8.92041 3.88438 8.92041Z"
              fill="white"
            />
          </svg>
        </button>

        {/* Delete Classification Button */}
        <button
          className="w-6 h-6 flex items-center justify-center rounded bg-red-600 text-white font-bold text-lg ml-1 hover:bg-red-700 transition-colors"
          onClick={() => setShowDeleteModal(true)}
          title={`Delete selected ${className} instance`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      {/* Instance Indicator */}
      {filteredEntries.length > 1 && (
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          {filteredEntries[selectedClassificationIndex]?.confidence_score && (
            <span className="text-blue-600">
              (Confidence:{" "}
              {filteredEntries[selectedClassificationIndex].confidence_score}%)
            </span>
          )}
          {filteredEntries[selectedClassificationIndex]?.page_number && (
            <span className="text-green-600">
              (Page: {filteredEntries[selectedClassificationIndex].page_number})
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3 items-center flex-wrap">
        <button
          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition ${
            assignedDepartments.includes(className)
              ? "border-green-400 text-green-600 bg-green-50"
              : "border-blue-400 text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setShowAssignModal(true)}
          disabled={assignedDepartments.includes(className)}
        >
          {assignedDepartments.includes(className)
            ? "Assigned"
            : "Assign Department"}
        </button>

        <button
          className="text-xs px-3 py-1 rounded-lg border border-gray-400 text-gray-600 font-semibold hover:bg-gray-50"
          onClick={() => setShowFeedback(!showFeedback)}
        >
          {showFeedback ? "Hide" : "Show"} Feedback ({classFeedback.length})
        </button>

        {/* Confidence filter */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-600">Min confidence</label>
          <select
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            value={minConfidence ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setMinConfidence(val === "" ? null : Number(val));
              setSelectedClassificationIndex(0); // Reset selection when filter changes
              if (val !== "") {
                updateClassificationFilter(bookId, className, Number(val))
                  .then(() => toast.success("Filter saved"))
                  .catch(() => toast.error("Failed to save filter"));
              }
            }}
          >
            <option value="">All</option>
            <option value="50">50+</option>
            <option value="60">60+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </div>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Feedback
            </span>
            <button
              className="text-xs px-2 py-1 rounded border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            >
              {showFeedbackForm ? "Cancel" : "Add Feedback"}
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="bg-white rounded-lg p-3 mb-3 border">
              <div className="mb-3">
                <textarea
                  placeholder="Add your feedback"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Upload Image (optional)
                </button>
                {isImageLoading && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-500">Processing image...</span>
                  </div>
                )}
                {imagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={
                    isSubmitting || (!feedbackComment.trim() && !feedbackImage)
                  }
                  className="text-xs px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedbackComment("");
                    setFeedbackImage(null);
                    setImagePreview(null);
                  }}
                  className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Feedback List */}
          <div className="space-y-2">
            {classFeedback.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No feedback yet</p>
            ) : (
              classFeedback.map((item: FeedbackItem, index: number) => (
                <div key={index} className="bg-white rounded-lg p-2 border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {item.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="text-xs text-gray-600 mb-2">{item.comment}</p>
                  )}
                  {item.image_url && (
                    <div className="relative">
                      {loadingImageUrls.has(item.image_url) && (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`}
                        alt="Feedback"
                        className={`w-20 h-20 object-cover rounded border ${
                          loadingImageUrls.has(item.image_url) ? 'hidden' : ''
                        }`}
                        height={80}
                        width={80}
                        onLoad={() => handleImageLoad(item.image_url!)}
                        onError={() => handleImageError(item.image_url!)}
                        onLoadStart={() => addImageToLoading(item.image_url!)}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign Department Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Assign to {className}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to assign this book to the {className}{" "}
              department?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAssignDepartment}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Assigning..." : "Assign"}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Classification Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete Classification Instance
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the <strong>{className}</strong>{" "}
              classification instance {selectedClassificationIndex + 1}? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteClassification}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
