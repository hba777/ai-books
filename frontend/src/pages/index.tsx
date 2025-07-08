import { useState } from "react";
import LandingSidebar from "../components/LandingPageComponents/LandingSidebar";
import LandingCard from "../components/LandingPageComponents/LandingCard";
import { HiOutlineBookOpen, HiOutlineSparkles, HiOutlineUsers } from "react-icons/hi2";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLoginClick = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleUserLogin = () => {
    // Implement user login navigation
    alert("User login clicked");
  };
  const handleAdminLogin = () => {
    // Implement admin login navigation
    alert("Admin login clicked");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 relative px-4">
      <header className="w-full max-w-3xl mx-auto text-center mt-16 mb-10">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">AI Book: All-in-One Book Management</h1>
        <p className="text-lg text-gray-600 mb-6">
          Effortlessly manage, classify, and analyze books for departments, libraries, and organizations. <br/>
          AI Book is your unified solution for uploading, organizing, and gaining insights from your book collections.
        </p>
        <button
          className="px-10 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold shadow-lg hover:bg-blue-700 transition"
          onClick={handleLoginClick}
        >
          Login
        </button>
      </header>
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <LandingCard
          title="Smart Classification"
          description="Automatically classify books and documents by genre, subject, or department using advanced AI."
          icon={<HiOutlineSparkles />}
        />
        <LandingCard
          title="Centralized Management"
          description="Upload, assign, and track books across multiple departments or libraries from a single dashboard."
          icon={<HiOutlineBookOpen />}
        />
        <LandingCard
          title="Collaboration & Insights"
          description="Enable teams to review, analyze, and generate reports on book collections with ease."
          icon={<HiOutlineUsers />}
        />
      </section>
      <section className="w-full max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Why Choose AI Book?</h2>
        <p className="text-gray-600 text-base mb-2">
          - Save time with automated classification and analytics.<br/>
          - Keep your collections organized and accessible.<br/>
          - Empower your team with collaborative tools and insightful reports.<br/>
          - Secure, scalable, and easy to use for any organization size.
        </p>
      </section>
      <LandingSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        onUserLogin={handleUserLogin}
        onAdminLogin={handleAdminLogin}
      />
    </div>
  );
}
