import React, { useState } from "react";
import api from "../../lib/api";
import { User } from "../../context/UserContext"



interface AdminDashboardEditFormProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const AdminDashboardEditForm: React.FC<AdminDashboardEditFormProps> = ({
  user,
  open,
  onClose,
  onUserUpdated,
}) => {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "user");
  const [department, setDepartment] = useState(user?.department || "");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setUsername(user?.username || "");
    setRole(user?.role || "user");
    setPassword("");
    setDepartment(user?.department || "");
    setError(null);
  }, [user, open]);

  if (!open || !user) return null;

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const update: any = { username, role, department };
      if (password) update.password = password;
      await api.patch(`/users/${user.id}`, update);
      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative border-t-4 border-blue-500" style={{ borderTopWidth: "6px" }}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Edit User
        </h2>
        <form onSubmit={handleEditUser} className="flex flex-col gap-4 w-full">
          <input
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="New Password (leave blank to keep current)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="department"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="py-2 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={formLoading}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboardEditForm;
