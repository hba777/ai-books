import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { BsLightningCharge } from "react-icons/bs";
import { FaRegMoon } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LuChartColumn, LuBookOpenCheck, LuBrain } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { FiGrid } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosHelpCircleOutline } from "react-icons/io";

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
  {
    label: "Reports",
    href: "/reports",
    icon: <MdAccessTime className="text-2xl" />,
    subtitle: "Of Books",
  },
  {
    label: "Review Content",
    href: "/review",
    icon: <LuBrain className="text-2xl" />,
    subtitle: "AI Training & Settings",
  },
];

const otherLinks = [
  {
    label: "Settings",
    href: "/settings",
    icon: <IoSettingsOutline className="text-base" />,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: <IoIosHelpCircleOutline className="text-base" />,
  },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const active = (href: string) => router.pathname === href;
  const [username, setUsername] = useState("Mario Rossi");
  const [email, setEmail] = useState("mario@restaurant.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded && decoded.sub) setUsername(decoded.sub);
          if (decoded && decoded.email) setEmail(decoded.email);
        } catch {}
      }
    }
  }, []);

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
          <div className="flex items-center justify-between mb-10">
            {!collapsed && (
              <div className="flex items-center gap-3 transition-opacity duration-300">
                <div className="bg-[#2563EB] p-2 rounded-xl">
                  <BsLightningCharge className="text-white text-2xl" />
                </div>
                <div className="font-bold text-2xl text-gray-900">AI Book</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {!collapsed && (
                <button className="p-1.5 rounded-md hover:bg-gray-100 transition">
                  <FaRegMoon className="text-gray-400 text-lg" />
                </button>
              )}
              <button
                className="p-1.5 rounded-md hover:bg-gray-100 transition"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <IoIosArrowForward className="text-gray-500 text-2xl" />
                ) : (
                  <IoIosArrowBack className="text-gray-400 text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>

        {!collapsed && (
          <>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="px-6">
              <nav className="flex flex-col gap-3">
                <div className="text-xs text-gray-400 px-2 mb-2">
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
                      <span className="flex flex-col items-start">
                        <span>{link.label}</span>
                        <span className="text-xs font-normal text-gray-400 leading-tight mt-0.5">
                          {link.subtitle}
                        </span>
                      </span>
                    </a>
                  </Link>
                ))}
                <div className="text-xs text-gray-400 px-2 mt-6 mb-2">
                  OTHER
                </div>
                {otherLinks.map((link) => (
                  <Link href={link.href} key={link.href} legacyBehavior>
                    <a
                      className={`relative flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition transform duration-150 ${
                        active(link.href)
                          ? "bg-[#eff6ff] text-gray-700 shadow-md scale-[1.04]"
                          : "text-gray-700 hover:bg-gray-100 hover:shadow hover:scale-[1.03]"
                      }`}
                    >
                      {active(link.href) && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#60a5fa] rounded-full" />
                      )}
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                          active(link.href)
                            ? "bg-[#2563eb] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {link.icon}
                      </span>
                      {link.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 mt-8">
          <div className="bg-blue-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-blue-700 text-lg">
            M
          </div>
          <div>
            <div className="font-semibold text-gray-900">{username}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
