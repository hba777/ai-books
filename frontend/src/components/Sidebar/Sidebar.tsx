import React from "react";
import { BsLightningCharge } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/router";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Classification", href: "/classification" },
  { label: "In-depth Analysis", href: "/analysis" },
  { label: "Reports", href: "/reports" },
  { label: "Review Content", href: "/review" },
];

const otherLinks = [
  { label: "Settings", href: "/settings" },
  { label: "Help & Support", href: "/help" },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const active = (href: string) => router.pathname === href;

  return (
    <aside className="h-screen w-72 bg-white border-r flex flex-col justify-between py-6 px-4 shadow-md">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#2563EB] p-2 rounded-xl">
            <BsLightningCharge className="text-white text-2xl" />
          </div>
          <div className="font-bold text-xl text-gray-900">AI Book</div>
        </div>
        <nav className="flex flex-col gap-2">
          <div className="text-xs text-gray-400 px-2 mb-2">MAIN NAVIGATION</div>
          {navLinks.map(link => (
            <Link href={link.href} key={link.href} legacyBehavior>
              <a
                className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition ${active(link.href) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {link.label}
              </a>
            </Link>
          ))}
          <div className="text-xs text-gray-400 px-2 mt-6 mb-2">OTHER</div>
          {otherLinks.map(link => (
            <Link href={link.href} key={link.href} legacyBehavior>
              <a className="flex items-center w-full text-left px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition">
                {link.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 mt-8">
        <div className="bg-blue-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-blue-700 text-lg">
          M
        </div>
        <div>
          <div className="font-semibold text-gray-900">Mario Rossi</div>
          <div className="text-xs text-gray-500">mario@restaurant.com</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 