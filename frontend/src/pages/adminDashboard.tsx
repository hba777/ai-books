import React, { useEffect, useState } from "react";
import AdminDashboardForm from "../features/AdminDashboard/AdminDashboardForm";
import AdminDashboardTable from "../features/AdminDashboard/AdminDashboardTable";
import api from "../lib/api";
import AdminDashboardHeader from "@/features/AdminDashboard/AdminDashboardHeader";
import AdminDashboardDeletePopUp from "../features/AdminDashboard/AdminDashboardDeletePopUp";

interface User {
  id: string;
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/users/all");
      setUsers(res.data);
    } catch (err: any) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => {
    setSuccess("User added successfully!");
    setError(null);
    fetchUsers();
    setTimeout(() => setSuccess(null), 2000);
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setDeleteUserId(id);
    setDeleteUsername(user ? user.username : null);
    setShowDeletePopup(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/users/${deleteUserId}`);
      setSuccess("User deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete user");
    } finally {
      setLoading(false);
      setShowDeletePopup(false);
      setDeleteUserId(null);
      setDeleteUsername(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeletePopup(false);
    setDeleteUserId(null);
    setDeleteUsername(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col">
      <AdminDashboardHeader/>
      <AdminDashboardForm
        users={users}
        loading={loading}
        error={error}
        success={success}
        onUserAdded={handleUserAdded}
        onDeleteUser={handleDeleteUser}
        showAddUserModal={showAddUserModal}
        setShowAddUserModal={setShowAddUserModal}
      />
      <div className="w-full mx-auto px-4">
        <AdminDashboardTable users={users} loading={loading} onDeleteUser={handleDeleteUser} />
        {error && <div className="text-red-500 text-left mt-2">{error}</div>}
        {success && <div className="text-green-600 text-left mt-2">{success}</div>}
      </div>
      <AdminDashboardDeletePopUp
        open={showDeletePopup}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        username={deleteUsername || undefined}
      />
    </div>
  );
};

export default Dashboard;
