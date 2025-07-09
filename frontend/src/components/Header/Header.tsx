import React, { useState, useRef, useEffect } from "react";
import { LuBell } from "react-icons/lu";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/router";
import { FiUpload } from "react-icons/fi";

// Header with search, bell, and profile picture
export const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
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

  const handleLogout = () => {
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between w-full py-6 px-6 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-6 w-full max-w-xl">
        <div className="flex-1">
          <div className="relative w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="text-lg text-[#3b82f6]" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 ml-8">
        <div className="relative">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <LuBell className="text-2xl text-gray-500" />
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow"
              style={{ fontSize: "0.7rem" }}
            >
              3
            </span>
          </button>
        </div>
        <div className="relative" ref={avatarRef}>
          <div
            className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg shadow cursor-pointer select-none"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            M
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Welcome section with welcome text, subtext, and a button on the right
export const WelcomeSection: React.FC = () => {
  return (
    <section className="flex items-center justify-between w-full mb-6 ml-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Welcome back, Mario <span className="inline-block">👋</span>
        </h1>
        <p className="text-gray-500 text-base">
          Here's the data and analytics of books or documents.
        </p>
      </div>
      <button className="bg-gradient-to-r mr-5 from-blue-500 to-purple-500 text-white font-semibold px-10 py-3 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition min-w-[300px] flex items-center justify-center">
        <svg className="mr-2"
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_50_11481)">
            <path
              d="M10.4998 10.8347V5.83575"
              stroke="white"
              stroke-width="1.50006"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.83386 16.2503V3.75294C3.83386 3.20052 4.05331 2.67073 4.44393 2.28011C4.83455 1.88949 5.36434 1.67004 5.91676 1.67004H16.3312C16.5522 1.67004 16.7641 1.75782 16.9204 1.91407C17.0766 2.07032 17.1644 2.28224 17.1644 2.5032V17.5001C17.1644 17.721 17.0766 17.9329 16.9204 18.0892C16.7641 18.2454 16.5522 18.3332 16.3312 18.3332H5.91676C5.36434 18.3332 4.83455 18.1138 4.44393 17.7231C4.05331 17.3325 3.83386 16.8027 3.83386 16.2503ZM3.83386 16.2503C3.83386 15.6979 4.05331 15.1681 4.44393 14.7775C4.83455 14.3869 5.36434 14.1674 5.91676 14.1674H17.1644"
              stroke="white"
              stroke-width="1.50006"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.00098 8.33517L10.5005 10.8347L12.9999 8.33517"
              stroke="white"
              stroke-width="1.50006"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_50_11481">
              <rect
                width="19.9958"
                height="19.9958"
                fill="white"
                transform="translate(0.502197 0.00395203)"
              />
            </clipPath>
          </defs>
        </svg>
        Upload Books
      </button>
    </section>
  );
};

export default Header;
