import React from "react";
import { reviewTypeOptions, ReviewTypeKey } from "../constants";

interface ReviewFiltersProps {
  minConfidence: number;
  onMinConfidenceChange: (value: number) => void;
  onlyHumanReviewed: boolean;
  onOnlyHumanReviewedChange: (value: boolean) => void;
  selectedReviewTypes: ReviewTypeKey[];
  onSelectedReviewTypesChange: (value: ReviewTypeKey[]) => void;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  minConfidence,
  onMinConfidenceChange,
  onlyHumanReviewed,
  onOnlyHumanReviewedChange,
  selectedReviewTypes,
  onSelectedReviewTypesChange,
}) => {
  const toggleReviewType = (key: ReviewTypeKey) => {
    if (selectedReviewTypes.includes(key)) {
      onSelectedReviewTypesChange(selectedReviewTypes.filter(k => k !== key));
    } else {
      onSelectedReviewTypesChange([...selectedReviewTypes, key]);
    }
  };
  return (
    <div className="w-full mb-4 flex flex-wrap items-center gap-4 bg-white rounded-xl shadow p-4">
      {/* Multi-select for review types (agents) */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">Agents</label>
        <div className="flex flex-wrap gap-2 max-w-[600px]">
          {reviewTypeOptions.map(({ key, title }) => (
            <button
              type="button"
              key={key}
              onClick={() => toggleReviewType(key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedReviewTypes.includes(key)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
              title={title}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">Min Confidence</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={minConfidence}
          onChange={(e) => onMinConfidenceChange(Number(e.target.value))}
        >
          <option value={50}>50+</option>
          <option value={60}>60+</option>
          <option value={70}>70+</option>
          <option value={80}>80+</option>
          <option value={90}>90+</option>
        </select>
      </div>

      

      <button
        type="button"
        onClick={() => onOnlyHumanReviewedChange(!onlyHumanReviewed)}
        className={`px-4 py-2 rounded-md font-semibold transition-colors ${
          onlyHumanReviewed
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        title={onlyHumanReviewed ? "Show all issues" : "Show only human reviewed"}
      >
        {onlyHumanReviewed ? "View All Issues" : "View Human Reviewed"}
      </button>
    </div>
  );
};

export default ReviewFilters;


