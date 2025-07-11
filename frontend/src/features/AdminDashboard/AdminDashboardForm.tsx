import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import api from "../../lib/api";
import Header from "@/components/Header/Header";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AdminDashboardFormProps {
  users: User[];
  loading: boolean;
  error: string | null;
  success: string | null;
  onUserAdded: () => void;
  onDeleteUser: (id: string) => void;
  showAddUserModal: boolean;
  setShowAddUserModal: (open: boolean) => void;
}

const AdminDashboardForm: React.FC<AdminDashboardFormProps> = ({
  onUserAdded,
  showAddUserModal,
  setShowAddUserModal,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("user");
  const [formLoading, setFormLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post(
        "/users/register",
        { username, password, role }
      );
      setUsername("");
      setPassword("");
      setRole("user");
      onUserAdded();
    } catch (err: any) {
      // error handled by parent
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col pt-12 px-4">
      {/* Heading and Add Button */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xl font-bold text-gray-800">User Management</span>
        <button
          className="bg-blue-600 rounded-md p-2 flex items-center justify-center hover:bg-blue-700 transition"
          onClick={() => setShowAddUserModal(true)}
          aria-label="Add User"
        >
          <FiPlus className="text-white text-lg" />
        </button>
      </div>
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={() => setShowAddUserModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Add User</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4 w-full">
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
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="py-2 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                disabled={formLoading}
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardForm;
