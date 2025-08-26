import React, { useState, useRef, useEffect } from "react";
import { LuBell } from "react-icons/lu";
import { useRouter } from "next/router";
import { useUser } from "../../context/UserContext";

// Header with search, bell, and profile picture
export const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useUser();

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <header className="flex items-end justify-end w-full py-6 px-6 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-end gap-6">
        {/* <div className="relative">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <LuBell className="text-2xl text-gray-500" />
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow"
              style={{ fontSize: "0.7rem" }}
            >
              3
            </span>
          </button>
        </div> */}
        <div className="relative" ref={avatarRef}>
          <div
            className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg shadow cursor-pointer select-none"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : ""}
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


export default Header;
