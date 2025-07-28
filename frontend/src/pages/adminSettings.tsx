import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { toast } from "react-toastify";
import api from "../lib/api";
import AdminDashboardHeader from "@/features/AdminDashboard/AdminDashboardHeader";
import AdminDashboardForm from "@/features/AdminDashboard/AdminDashboardForm";
import AdminDashboardTable from "@/features/AdminDashboard/AdminDashboardTable";
import AdminDashboardDeletePopUp from "@/features/AdminDashboard/AdminDashboardDeletePopUp";
import AdminDashboardEditForm from "@/features/AdminDashboard/AdminDashboardEditForm";
import { User, useUser } from "../context/UserContext"


const AdminSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const { deleteUser } = useUser();

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
    toast.success("User added successfully!");
    setError(null);
    fetchUsers();
    setTimeout(() => setSuccess(null), 2000);
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
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
      await deleteUser(deleteUserId);
      toast.success("User deleted successfully!");
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

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setShowEditUserModal(true);
  };
  const handleUserUpdated = () => {
    toast.success("User updated successfully!");
    setError(null);
    fetchUsers();
    setTimeout(() => setSuccess(null), 2000);
    setShowEditUserModal(false);
    setEditUser(null);
  };
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
      <AdminDashboardHeader />
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
        <AdminDashboardTable
          users={users}
          loading={loading}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
        />
        {error && <div className="text-red-500 text-left mt-2">{error}</div>}
        {success && (
          <div className="text-green-600 text-left mt-2">{success}</div>
        )}
      </div>
      <AdminDashboardDeletePopUp
        open={showDeletePopup}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        username={deleteUsername || undefined}
      />
      <AdminDashboardEditForm
        user={editUser}
        open={showEditUserModal}
        onClose={() => { setShowEditUserModal(false); setEditUser(null); }}
        onUserUpdated={handleUserUpdated}
      />
      </main>
    </div>
  );
};

export default AdminSettings;
