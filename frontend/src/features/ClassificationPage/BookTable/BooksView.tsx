import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { CiViewTable } from "react-icons/ci";
import { IoGridOutline } from "react-icons/io5";
import BookGridView from "./BookGridView";
import { useClassificationContext } from "../ClassificationCardRow/ClassificationContext";
import BookTableView from "./BookTableView";

interface FilterOption {
  value: string;
  label: string;
}

interface BookTableProps {
  filterOptions?: FilterOption[];
}

const defaultFilterOptions: FilterOption[] = [
  { value: "All", label: "All Books" },
  { value: "Processed", label: "Total Processed" },
  { value: "Processing", label: "Currently Processing" },
  { value: "Pending", label: "Pending Books" },
  { value: "Assigned", label: "Assigned" },
];

const dummyBooks = [
  {
    id: "1",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    id: "2",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Unprocessed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    id: "3",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Assigned",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    id: "4",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    id: "5",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Pending",
    date: "1/15/2024",
    labels: "-- NIL --",
  },
  {
    id: "6",
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processing",
    date: "1/15/2024",
    labels: "-- NIL --",
  },
];

const statusColors: Record<string, string> = {
  Unprocessed: "bg-gray-50 text-grey-500 border border-grey-200",
  Processed: "bg-green-50 text-green-600 border border-green-200",
  Assigned: "bg-blue-50 text-blue-600 border border-blue-200",
  Pending: "bg-orange-50 text-orange-600 border border-orange-200",
  Processing: "bg-purple-50 text-purple-600 border border-purple-200",
};

const viewOptions = [
  { value: "table", icon: <CiViewTable className="text-2xl mr-2" /> },
  { value: "grid", icon: <IoGridOutline className="text-2xl mr-2" /> },
];

const BookTable: React.FC<BookTableProps> = ({ filterOptions }) => {
  const [view, setView] = useState<"table" | "grid" | null>(null);

  useEffect(() => {
    const savedView = localStorage.getItem("bookViewPreference");
    const validatedView = savedView === "grid" || savedView === "table" ? savedView : "table";
    setView(validatedView);
  }, []);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentFilter, setCurrentFilter } = useClassificationContext();

  const options = filterOptions || defaultFilterOptions;

  // Filter books based on current filter
  const filteredBooksRaw = dummyBooks.filter(book => {
    if (currentFilter === 'All') return true;
    return book.status === currentFilter;
  });

  // Convert labels to string[] for BookTableView
  const filteredBooks = filteredBooksRaw.map(book => ({
    ...book,
    labels: typeof book.labels === 'string'
      ? (book.labels === '-- NIL --' ? ['NIL'] : book.labels.split(',').map(l => l.trim()))
      : book.labels
  }));
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="w-full mt-4">
      {/* Search and controls */}
      <div className="flex items-center gap-6 bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2 max-w-[600px] ml-4">
          <FiSearch className="text-blue-400 text-lg mr-2" />
          <input
            type="text"
            placeholder="Search by name, author, or notes..."
            className="bg-transparent outline-none flex-1 text-gray-700"
          />
        </div>
        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value as any)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Custom Dropdown for view */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 min-w-[80px] h-10"
            onClick={() => setDropdownOpen((open) => !open)}
            type="button"
          >
            {viewOptions.find((opt) => opt.value === view)?.icon}
            <svg
              className="ml-3 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {viewOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`flex items-center justify-center w-full px-2 py-3 hover:bg-gray-100 transition ${
                    view === opt.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    const newView = opt.value as "table" | "grid";
                    setView(newView);
                    localStorage.setItem("bookViewPreference", newView);
                    setDropdownOpen(false);
                  }}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          )}
        </div>
       
      </div>

      {/* Filter indicator */}
      {currentFilter !== 'All' && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Showing:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {currentFilter}
          </span>
          <button
            onClick={() => setCurrentFilter('All')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Table or Grid View */}
      {view === "table" ? (
        <BookTableView filteredBooks={filteredBooks} statusColors={statusColors}/>
      ) : (
        <div className="rounded-2xl p-12 flex items-center justify-center min-h-[200px] text-lg">
          {/* Grid view with filtered books */}
          <BookGridView books={filteredBooks} />
        </div>
      )}
    </div>
  );
};

export default BookTable;
