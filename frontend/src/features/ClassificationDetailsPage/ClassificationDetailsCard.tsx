import React, { useState, useEffect } from "react";
import ClassCard from "./ClassCard";
import { useRouter } from "next/router";
import { useBooks } from "../../context/BookContext";
import {
  BookClassificationsResponse,
  ClassificationEntry,
} from "../../services/booksApi";

interface ClassificationDetailsCardProps {
  onSeeInfo?: () => void;
  onJumpToHighlight?: (className: string, direction: "next" | "prev") => void;
}

interface ClassData {
  name: string;
  count: number;
  entries: ClassificationEntry[];
}

const ClassificationDetailsCard: React.FC<ClassificationDetailsCardProps> = ({
  onSeeInfo,
  onJumpToHighlight,
}) => {
  const router = useRouter();
  const { id: bookId } = router.query;
  const { getBookClassifications } = useBooks();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch classification data
  useEffect(() => {
    const fetchClassifications = async () => {
      if (!bookId || typeof bookId !== "string") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response: BookClassificationsResponse =
          await getBookClassifications(bookId);

        // If response indicates not found
        if (!response || !response.classifications) {
          throw new Error("Classification data not found");
        }

        // Process classifications
        const grouped: { [key: string]: ClassificationEntry[] } = {};
        response.classifications.forEach((c: ClassificationEntry) => {
          const key = c.classification;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(c);
        });

        const classData: ClassData[] = Object.entries(grouped).map(
          ([name, entries]) => ({
            name,
            count: entries.length,
            entries,
          })
        );

        classData.sort((a, b) => b.count - a.count);
        setClasses(classData);
      } catch (err: any) {
        console.error("Error fetching classifications:", err);

        // Handle 404 gracefully
        if (err?.response?.status === 404) {
          setError("Classification pending");
        } else {
          setError("Failed to load classification data");
        }

        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, []);

  return (
    <div className="w-[400px] bg-white rounded-2xl shadow p-0 mt-8 ml-2 border border-blue-200 border-t-4 border-t-blue-500">
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg text-gray-900">
            Classification Result
          </span>
          <div className="flex">
            <button
              className="text-xs px-3 py-1 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50"
              onClick={onSeeInfo}
            >
              See Info
            </button>
          </div>
        </div>

        {!loading && !error && classes.length > 0 && (
          <div className="mb-3 text-gray-500 text-xs font-semibold">
            Classes
            <span className="font-normal">- No of Paragraphs</span>
            <span className="ml-2 text-blue-600">
              (Total: {classes.reduce((sum, cls) => sum + cls.count, 0)})
            </span>
          </div>
        )}

        {/* Class Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">
                Loading classifications...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Classification Pending</p>
            </div>
          ) : (
            bookId &&
            typeof bookId === "string" &&
            classes.map((cls: ClassData, idx: number) => (
              <ClassCard
                key={idx}
                className={cls.name}
                count={cls.count}
                entries={cls.entries}
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
