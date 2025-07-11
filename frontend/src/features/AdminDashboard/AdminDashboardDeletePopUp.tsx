import React from "react";

interface AdminDashboardDeletePopUpProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

const AdminDashboardDeletePopUp: React.FC<AdminDashboardDeletePopUpProps> = ({
  open,
  onClose,
  onConfirm,
  username,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">Delete User</h2>
        <p className="text-gray-700 mb-6 text-center">
          Are you sure you want to delete
          {username ? (
            <span className="font-semibold text-red-600"> {username} </span>
          ) : (
            " this user "
          )}
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardDeletePopUp;
