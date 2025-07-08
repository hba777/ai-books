import React, { useState } from "react";
import api from "../lib/api";

interface LandingSidebarProps {
  open: boolean;
  onClose: () => void;
  onUserLogin?: () => void;
  onAdminLogin?: () => void;
}

type View = "menu" | "login" | "register";

const LandingSidebar: React.FC<LandingSidebarProps> = ({ open, onClose }) => {
  const [view, setView] = useState<View>("menu");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setSuccess("Login successful!");
      // You can store token or redirect here
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/users/register", { username, password });
      setSuccess("Registration successful! You can now log in.");
      setView("login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
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
      <button
        className="py-3 px-6 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        onClick={() => { resetForm(); setView("register"); }}
      >
        Register
      </button>
    </>
  );

  const renderForm = (type: "login" | "register") => (
    <form onSubmit={type === "login" ? handleLogin : handleRegister} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">{type === "login" ? "Login" : "Register"}</h2>
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
        {loading ? (type === "login" ? "Logging in..." : "Registering...") : (type === "login" ? "Login" : "Register")}
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
          {view === "register" && renderForm("register")}
        </div>
      </div>
    </div>
  );
};

export default LandingSidebar; 