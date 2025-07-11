import React, { useState, useRef, useEffect } from "react";
import { BsLightningCharge } from "react-icons/bs";
import { useRouter } from "next/router";
import api from "../../lib/api";

const AdminDashboardHeader: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch user info from backend using cookie
    api.get("/users/me")
      .then(res => {
        if (res.data && res.data.username) {
          setUserInitial(res.data.username.charAt(0).toUpperCase());
        }
      })
      .catch(() => {
        setUserInitial("");
      });
  }, []);

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
    try {
      await api.post("/users/logout");
    } catch (err) {
      // Optionally handle error (e.g., show a toast)
    }
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between w-full py-6 px-6 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-xl flex items-center justify-center">
          <BsLightningCharge className="text-white text-2xl" />
        </div>
        <div className="font-bold text-2xl text-gray-900 whitespace-nowrap">
          Admin Dashboard
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={avatarRef}>
          <div
            className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg shadow cursor-pointer select-none"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {userInitial}
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

export default AdminDashboardHeader;
