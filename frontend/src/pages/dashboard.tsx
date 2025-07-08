import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useRouter } from "next/router";

interface User {
  id: string;
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/users/register",
        { username, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("User added successfully!");
      setUsername("");
      setPassword("");
      setRole("user");
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("User deleted successfully!");
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Admin Dashboard</h1>
        <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <input
            className="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            disabled={loading}
          >
            Add User
          </button>
        </form>
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        {success && <div className="text-green-600 text-center mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left text-gray-700">Username</th>
                <th className="py-2 px-4 text-left text-gray-700">Role</th>
                <th className="py-2 px-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4 capitalize">{user.role}</td>
                  <td className="py-2 px-4">
                    <button
                      className="py-1 px-4 rounded bg-red-500 text-white hover:bg-red-600 transition"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
