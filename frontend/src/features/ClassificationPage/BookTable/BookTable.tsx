    import React, { useState, useRef, useEffect } from "react";
    import { FiSearch } from "react-icons/fi";
    import { CiViewTable } from "react-icons/ci";
    import { IoGridOutline } from "react-icons/io5";
import BookGridView from "./BookGridView";


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
    Processed: "bg-green-50 text-green-600 border border-green-200",
    Assigned: "bg-blue-50 text-blue-600 border border-blue-200",
    Pending: "bg-orange-50 text-orange-600 border border-orange-200",
    Processing: "bg-purple-50 text-purple-600 border border-purple-200",
    };

    const viewOptions = [
    { value: "table", icon: <CiViewTable className="text-2xl mr-2" /> },
    { value: "grid",  icon: <IoGridOutline className="text-2xl mr-2" /> },
    ];

    const BookTable: React.FC = () => {
    const [view, setView] = useState<'table' | 'grid'>("table");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        <div className="flex items-center gap-3 bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2 max-w-[600px]">
            <FiSearch className="text-blue-400 text-lg mr-2" />
            <input
                type="text"
                placeholder="Search by name, author, or notes..."
                className="bg-transparent outline-none flex-1 text-gray-700"
            />
            </div>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
            <option>All Books</option>
            </select>
            {/* Custom Dropdown for view */}
            <div className="relative" ref={dropdownRef}>
            <button
                className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 min-w-[120px] h-12"
                onClick={() => setDropdownOpen((open) => !open)}
                type="button"
            >
                {viewOptions.find(opt => opt.value === view)?.icon}
                <svg className="ml-1 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {viewOptions.map(opt => (
                    <button
                    key={opt.value}
                    className={`flex items-center justify-center w-full px-2 py-3 hover:bg-gray-100 transition ${view === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    onClick={() => { setView(opt.value as 'table' | 'grid'); setDropdownOpen(false); }}
                    >
                    {opt.icon}
                    </button>
                ))}
                </div>
            )}
            </div>
            <button className="ml-2 bg-gradient-to-r from-[#3B82F6] to-[#9333EA] opacity-40 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition">
            Start Processing
            </button>
        </div>

        {/* Table or Grid View */}
        {view === 'table' ? (
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="min-w-full text-left">
                <thead>
                <tr className="text-gray-400 text-sm border-b">
                    <th className="py-4 px-6 font-semibold">Title <span className="align-middle">↕</span></th>
                    <th className="py-4 px-6 font-semibold">Author</th>
                    <th className="py-4 px-6 font-semibold">Status <span className="align-middle">↕</span></th>
                    <th className="py-4 px-6 font-semibold">Date Submitted</th>
                    <th className="py-4 px-6 font-semibold">Labels (If Classified)</th>
                </tr>
                </thead>
                <tbody>
                {dummyBooks.map((book, idx) => (
                    <tr
                    key={idx}
                    className={
                        idx === 3
                        ? "bg-blue-50/60"
                        : "hover:bg-gray-50 transition"
                    }
                    >
                    <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">{book.title}</td>
                    <td className="py-4 px-6 text-gray-700 whitespace-nowrap">{book.author}</td>
                    <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[book.status] || 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {book.status}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{book.date}</td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                        {book.labels.includes("NIL") ? <span className="text-gray-700 font-bold">-- NIL --</span> : book.labels}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="rounded-2xl p-12 flex items-center justify-center min-h-[200px] text-lg">
            {/* Placeholder for grid view */}
            <BookGridView/>
            </div>
        )}
        </div>
    );
    };

    export default BookTable;
