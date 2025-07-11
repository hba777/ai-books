import React from "react";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AdminDashboardTableProps {
  users: User[];
  loading: boolean;
  onDeleteUser: (id: string) => void;
}

const AdminDashboardTable: React.FC<AdminDashboardTableProps> = ({ users, loading, onDeleteUser }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="from-[#3B82F6] to-[#9333EA] bg-gradient-to-bl">
          <tr>
            <th className="py-3 px-6 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">Username</th>
            <th className="py-3 px-6 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">Role</th>
            <th className="py-3 px-6 text-center text-xs font-bold text-gray-200 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-blue-50 transition">
              <td className="py-3 px-6 font-medium text-gray-900">{user.username}</td>
              <td className="py-3 px-6 capitalize text-gray-700">{user.role}</td>
              <td className="py-3 px-6 text-center">
                <button
                  className="py-1 px-4 rounded bg-red-500 text-white hover:bg-red-600 transition text-sm font-semibold"
                  onClick={() => onDeleteUser(user.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 px-6 text-center text-gray-400">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboardTable;
