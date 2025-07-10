import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { CiViewTable } from "react-icons/ci";
import { IoGridOutline } from "react-icons/io5";
import BookGridView from "./BookGridView";
import { useClassificationContext } from "../ClassificationCardRow/ClassificationContext";

const dummyBooks = [
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Unprocessed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Assigned",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Processed",
    date: "1/15/2024",
    labels: "History, Geo-Political, Religious",
  },
  {
    title: "The Kite Runner",
    author: "Khalid Hussaini",
    status: "Pending",
    date: "1/15/2024",
    labels: "-- NIL --",
  },
  {
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

const BookTable: React.FC = () => {
  const [view, setView] = useState<"table" | "grid" | null>(null);

  useEffect(() => {
    const savedView = localStorage.getItem("bookViewPreference");
    const validatedView = savedView === "grid" || savedView === "table" ? savedView : "table";
    setView(validatedView);
  }, []);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentFilter, setCurrentFilter } = useClassificationContext();

  // Filter books based on current filter
  const filteredBooks = dummyBooks.filter(book => {
    if (currentFilter === 'All') return true;
    return book.status === currentFilter;
  });

  // Convert table books to grid books format
  const gridBooks = filteredBooks.map(book => ({
    title: book.title,
    author: book.author,
    status: book.status,
    percent: book.status === 'Processed' ? 100 : 
             book.status === 'Processing' ? 50 : 
             book.status === 'Assigned' ? 100 : 
             book.status === 'Pending' ? 0 : 0,
    startDate: book.date,
    endDate: book.status === 'Processed' ? book.date : null,
    uploadDate: book.date,
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
          <option value="All">All Books</option>
          <option value="Processed">Total Processed</option>
          <option value="Processing">Currently Processing</option>
          <option value="Pending">Pending Books</option>
          <option value="Assigned">Assigned</option>
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
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm border-b">
                <th className="flex py-4 px-6 font-semibold">
                  Name
                  <svg
                    className="mt-1"
                    width="25"
                    height="17"
                    viewBox="0 0 25 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_50_13170)">
                      <path
                        d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M19.8484 13.4967V2.83008"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13.1819 2.83008V13.4967"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_50_13170">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                          transform="translate(8.51514 0.163391)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </th>
                <th className="py-4 px-6 font-semibold">Author</th>
                <th className="flex py-4 px-6 font-semibold">
                  Status <svg
                    className="mt-1"
                    width="25"
                    height="17"
                    viewBox="0 0 25 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_50_13170)">
                      <path
                        d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M19.8484 13.4967V2.83008"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13.1819 2.83008V13.4967"
                        stroke="#111827"
                        stroke-width="1.33333"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_50_13170">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                          transform="translate(8.51514 0.163391)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </th>
                <th className="py-4 px-6 font-semibold">Date Submitted</th>
                <th className="py-4 px-6 font-semibold">
                  Labels (If Classified)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book, idx) => (
                <tr
                  key={idx}
                  className={
                    idx === 3 ? "bg-blue-50/60" : "hover:bg-gray-50 transition"
                  }
                >
                  <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                    {book.title}
                  </td>
                  <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                    {book.author}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[book.status] ||
                        "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {book.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                    {book.date}
                  </td>
                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                    {book.labels.includes("NIL") ? (
                      <span className="text-gray-700 font-bold">-- NIL --</span>
                    ) : (
                      book.labels
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl p-12 flex items-center justify-center min-h-[200px] text-lg">
          {/* Grid view with filtered books */}
          <BookGridView books={gridBooks} />
        </div>
      )}
    </div>
  );
};

export default BookTable;
