import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar/Sidebar";

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
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        
      </main>
    </div>
  );
};

export default Dashboard;
