import React, { useState, useEffect } from "react";
import ClassCard from "./ClassCard";
import { useRouter } from "next/router";
import { useBooks } from "../../context/BookContext";
import { BookClassificationsResponse } from "../../services/booksApi";

interface ClassificationDetailsCardProps {
  onSeeInfo?: () => void;
  onJumpToHighlight?: (className: string, direction: 'next' | 'prev') => void;
}

interface ClassData {
  name: string;
  count: number;
}

const ClassificationDetailsCard: React.FC<ClassificationDetailsCardProps> = ({ onSeeInfo, onJumpToHighlight }) => {
  const router = useRouter();
  const { id: bookId } = router.query;
  const { books, getBookClassifications } = useBooks();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch classification data
  useEffect(() => {
    const fetchClassifications = async () => {
      if (!bookId || typeof bookId !== 'string') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response: BookClassificationsResponse = await getBookClassifications(bookId);
                
        // Process classifications to count occurrences
        const classCounts: { [key: string]: number } = {};
        
        if (response.classifications && Array.isArray(response.classifications)) {
          response.classifications.forEach(classification => {
            classCounts[classification] = (classCounts[classification] || 0) + 1;
          });
        }
                
        // Convert to array format
        const classData: ClassData[] = Object.entries(classCounts).map(([name, count]) => ({
          name,
          count
        }));
        
        // Sort by count (descending)
        classData.sort((a, b) => b.count - a.count);
        
        setClasses(classData);
      } catch (err) {
        console.error('Error fetching classifications:', err);
        setError('Failed to load classification data');
        // Fallback to empty array
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, []);

  return (
    <div className="w-[370px] bg-white rounded-2xl shadow p-0 mt-8 ml-2 border border-blue-200 border-t-4 border-t-blue-500">
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg text-gray-900">
            Classification Result
          </span>
        </div>
        
        <div className="mb-3 text-gray-500 text-xs font-semibold">
          Classes <span className="font-normal">- No of Paragraphs</span>
          {!loading && !error && classes.length > 0 && (
            <span className="ml-2 text-blue-600">
              (Total: {classes.reduce((sum, cls) => sum + cls.count, 0)})
            </span>
          )}
        </div>
        
        {/* Class Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading classifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No classifications found</p>
            </div>
          ) : (
            bookId && typeof bookId === 'string' && classes.map((cls: ClassData, idx: number) => (
              <ClassCard
                key={idx}
                className={cls.name}
                count={cls.count}
                bookId={bookId}
                onJumpToHighlight={onJumpToHighlight || (() => {})}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationDetailsCard;
