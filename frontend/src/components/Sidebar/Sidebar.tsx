import React, { useState, useEffect } from "react";
import { BsLightningCharge } from "react-icons/bs";
import { FaRegMoon } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LuChartColumn, LuBookOpenCheck, LuBrain } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { FiGrid } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { RiArchiveDrawerLine } from "react-icons/ri";
import { useUser } from "../../context/UserContext";

import Link from "next/link";
import { useRouter } from "next/router";

const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LuChartColumn className="text-2xl" />,
    subtitle: "Overview & Analytics",
  },
  {
    label: "Classification",
    href: "/classification",
    icon: <FiGrid className="text-2xl" />,
    subtitle: "of Books & Documents",
  },
  {
    label: "In-depth Analysis",
    href: "/analysis",
    icon: <LuBookOpenCheck className="text-2xl" />,
    subtitle: "Review of Classified Books",
  },
  // {
  //   label: "Reports",
  //   href: "/reports",
  //   icon: <MdAccessTime className="text-2xl" />,
  //   subtitle: "Of Books",
  // },
  {
    label: "Agents",
    href: "/agents",
    icon: <LuBrain className="text-2xl" />,
    subtitle: "AI Training & Settings",
  },
  // {
  //   label: "Archived Books",
  //   href: "/archivedBooks",
  //   icon: <RiArchiveDrawerLine className="text-2xl" />,
  //   subtitle: "View Archived Books",
  // }
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const active = (href: string) => router.pathname === href;


  return (
    <aside
      className={`min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-8 shadow-md overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-80"
      }`}
    >
      <div>
        <div
          className={`px-6 transition-all duration-300 ${
            collapsed ? "px-2" : "px-6"
          }`}
        >
          <div
            className={`flex items-center mb-10 transition-all duration-300 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {collapsed ? (
              // Only show the collapse/expand button centered
              <button
                className="p-1.5 rounded-md hover:bg-gray-100 transition"
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Expand sidebar"
              >
                <IoIosArrowForward className="text-gray-500 text-xl" />
              </button>
            ) : (
              <>
                {/* AI Book Logo and Title */}
                <div
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                  style={{ pointerEvents: collapsed ? "none" : "auto" }} // Disable clicks for this section when hidden
                >
                  <div className="bg-[#2563EB] p-2 rounded-xl">
                    <BsLightningCharge className="text-white text-2xl" />
                  </div>
                  <div className="font-bold text-2xl text-gray-900 whitespace-nowrap">
                    AI Book
                  </div>
                </div>
                {/* Buttons container (moon and collapse): Ensure it's always clickable */}
                <div className="flex items-center gap-2">
                  {/* Moon button: Only hide if collapsed */}
                  <button
                    className={`p-1.5 rounded-md hover:bg-gray-100 transition ${
                      collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                    }`}
                    style={{ pointerEvents: collapsed ? "none" : "auto" }} // Disable clicks on this button when hidden
                  >
                    <FaRegMoon className="text-gray-400 text-lg" />
                  </button>
                  {/* Collapse/Expand button: ALWAYS clickable, no pointer-events: none */}
                  <button
                    className="p-1.5 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={
                      collapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                  >
                    {collapsed ? (
                      <IoIosArrowForward className="text-gray-500 text-xl mr-4" />
                    ) : (
                      <IoIosArrowBack className="text-gray-400 text-lg" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main content area: Nav links, other links */}
        <div
          className={`transition-all duration-300 ${
            collapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
          }`}
          style={{ pointerEvents: collapsed ? "none" : "auto" }} // Disable clicks for all content inside this div when hidden
        >
          <hr className="border-t border-gray-200 mb-4" />
          <div className="px-6">
            <nav className="flex flex-col gap-3">
              <div className="text-xs text-gray-400 px-2 mb-2 whitespace-nowrap">
                MAIN NAVIGATION
              </div>
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href} legacyBehavior>
                  <a
                    className={`flex items-center w-full text-left px-5 py-3 rounded-xl font-semibold transition transform duration-150 text-lg ${
                      active(link.href)
                        ? "bg-[#eff6ff] text-gray-700 shadow-md scale-[1.04]"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow hover:scale-[1.03]"
                    }`}
                  >
                    {active(link.href) && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#60a5fa] rounded-full" />
                    )}
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 ${
                        active(link.href)
                          ? "bg-[#2563eb] text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span className="flex flex-col items-start whitespace-nowrap">
                      <span>{link.label}</span>
                      <span className="text-xs font-normal text-gray-400 leading-tight mt-0.5">
                        {link.subtitle}
                      </span>
                    </span>
                  </a>
                </Link>
              ))}
              <div className="text-xs text-gray-400 px-2 mt-6 mb-2 whitespace-nowrap">
                OTHER
              </div>
              {/* Only show Admin Settings if role is admin */}
              {user?.role === 'admin' && (
                <Link href="/adminSettings" legacyBehavior>
                  <a
                    className={`relative flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition transform duration-150 text-lg ${
                      active('/adminSettings')
                        ? "bg-[#eff6ff] text-gray-700 shadow-md scale-[1.04]"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow hover:scale-[1.03]"
                    }`}
                  >
                    {active('/adminSettings') && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#60a5fa] rounded-full" />
                    )}
                    <span className={`flex items-center justify-center w-9 h-9 rounded-lg mr-3 ${
                      active('/adminSettings') ? 'bg-[#2563eb] text-white' : 'bg-gray-100'
                    }`}>
                      <IoSettingsOutline className="text-base" />
                    </span>
                    <span className="whitespace-nowrap">Admin Settings</span>
                  </a>
                </Link>
              )}
              <Link href="/help" legacyBehavior>
                <a
                  className={`relative flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition transform duration-150 text-lg ${
                    active('/help')
                      ? "bg-[#eff6ff] text-gray-700 shadow-md scale-[1.04]"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow hover:scale-[1.03]"
                  }`}
                >
                  {active('/help') && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#60a5fa] rounded-full" />
                  )}
                  <span className={`flex items-center justify-center w-9 h-9 rounded-lg mr-3 ${
                    active('/help') ? 'bg-[#2563eb] text-white' : 'bg-gray-100'
                  }`}>
                    <IoIosHelpCircleOutline className="text-base" />
                  </span>
                  <span className="whitespace-nowrap">Help & Support</span>
                </a>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
