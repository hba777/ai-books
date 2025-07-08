import React, { useState } from "react";
import api from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";

interface LandingSidebarProps {
  open: boolean;
  onClose: () => void;
  onUserLogin?: () => void;
  onAdminLogin?: () => void;
}

type View = "menu" | "login";

const LandingSidebar: React.FC<LandingSidebarProps> = ({ open, onClose }) => {
  const [view, setView] = useState<View>("menu");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post("/users/login", { username, password });
      console.log("Login response:", res.data);
      // Decode JWT token
      const decoded = jwtDecode(res.data.token);
      console.log("Decoded JWT:", decoded);
      // Save token to localStorage
      localStorage.setItem("token", res.data.token);
      setSuccess("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const renderMenu = () => (
    <>
      <h2 className="text-2xl font-semibold mb-8 text-center">Login</h2>
      <button
        className="mb-4 py-3 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        onClick={() => { resetForm(); setView("login"); }}
      >
        Login as user
      </button>
    </>
  );

  const renderForm = (type: "login") => (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
      <input
        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {success && <div className="text-green-600 text-sm text-center">{success}</div>}
      <button
        type="submit"
        className="py-3 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <button
        type="button"
        className="text-gray-500 hover:underline mt-2"
        onClick={() => setView("menu")}
      >
        Back
      </button>
    </form>
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ borderTopLeftRadius: '1.5rem', borderBottomLeftRadius: '1.5rem' }}
    >
      <div className="flex flex-col h-full p-8">
        <button
          className="self-end text-gray-400 hover:text-gray-600 text-2xl mb-8"
          onClick={() => { onClose(); setView("menu"); }}
          aria-label="Close sidebar"
        >
          &times;
        </button>
        <div className="flex-1 flex flex-col justify-center">
          {view === "menu" && renderMenu()}
          {view === "login" && renderForm("login")}
        </div>
      </div>
    </div>
  );
};

export default LandingSidebar; 