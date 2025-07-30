import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useBooks } from "../../context/BookContext";
import { Feedback } from "../../services/booksApi";

interface AssignedDepartmentsProps {
  assignedDepartments?: string[];
  bookId: string;
  feedback?: Feedback[];
}

const AssignedDepartments: React.FC<AssignedDepartmentsProps> = ({ 
  assignedDepartments = [], 
  bookId,
  feedback = []
}) => {
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  
  const { user } = useUser();
  const { addFeedback } = useBooks();

  const handleShowFeedback = (department: string) => {
    setShowFeedback(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
    if (!showFeedback[department]) {
      setFeedbackText(prev => ({
        ...prev,
        [department]: ""
      }));
    }
  };

  const handleSubmitFeedback = async (department: string) => {
    if (!feedbackText[department]?.trim()) return;

    setSubmitting(prev => ({ ...prev, [department]: true }));
    
    try {
      await addFeedback(bookId, feedbackText[department], department);
      setFeedbackText(prev => ({ ...prev, [department]: "" }));
      setShowFeedback(prev => ({ ...prev, [department]: false }));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmitting(prev => ({ ...prev, [department]: false }));
    }
  };

  if (assignedDepartments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Assigned Departments</h3>
        <p className="text-gray-500 text-sm">No departments assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Assigned Departments</h3>
      <div className="space-y-3">
        {assignedDepartments.map((department) => (
          <div key={department} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{department}</span>
              <button
                onClick={() => handleShowFeedback(department)}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                {showFeedback[department] ? "Cancel" : "Give Feedback"}
              </button>
            </div>
            {/* Feedback List for this department */}
            {feedback.filter(fb => fb.department === department).length > 0 && (
              <div className="mt-2 space-y-2">
                {feedback.filter(fb => fb.department === department).map((fb, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-700">{fb.username}</span>
                      <span className="text-xs text-gray-400">{new Date(fb.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">{fb.comment}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Feedback Form */}
            {showFeedback[department] && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <textarea
                  value={feedbackText[department] || ""}
                  onChange={(e) => setFeedbackText(prev => ({
                    ...prev,
                    [department]: e.target.value
                  }))}
                  placeholder="Write your feedback here..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {(feedbackText[department]?.length || 0)}/500 characters
                  </span>
                  <button
                    onClick={() => handleSubmitFeedback(department)}
                    disabled={!feedbackText[department]?.trim() || submitting[department]}
                    className="text-xs px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting[department] ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedDepartments;
