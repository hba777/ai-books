import React, { useState } from "react";
import { Book } from "../../services/booksApi";
import { useBooks } from "../../context/BookContext";
import { toast } from "react-toastify";

interface SeeInfoProps {
  onClose?: () => void;
  book: Book;
}

const SeeInfo: React.FC<SeeInfoProps> = ({ onClose, book }) => {
  const { updateBook } = useBooks();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...book });
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format labels for display
  const formatLabels = (labels: string[] | null | undefined) => {
    if (!labels || labels.length === 0) return "No labels assigned";
    return labels.join(", ");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, labels: e.target.value.split(",").map(l => l.trim()).filter(Boolean) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBook(book._id, {
        ...form,
        labels: form.labels,
      });
      toast.success("Book info updated successfully");
      setEditMode(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error("Failed to update book info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl relative border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-6">Book Information</h2>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Book Title</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="doc_name"
              value={form.doc_name}
              onChange={handleChange}
              readOnly={!editMode}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Author Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="author"
              value={form.author}
              onChange={handleChange}
              readOnly={!editMode}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Date Submitted</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="date"
              value={form.date}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Start Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="startDate"
              value={form.startDate || ""}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">End Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="endDate"
              value={form.endDate || ""}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">General Category</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="category"
              value={form.category}
              onChange={handleChange}
              readOnly={!editMode}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Classification Labels</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              name="labels"
              value={editMode ? (Array.isArray(form.labels) ? form.labels.join(", ") : "") : formatLabels(form.labels)}
              onChange={handleLabelsChange}
              readOnly={!editMode}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Abstract</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
              placeholder="Max 200 words"
              name="summary"
              rows={3}
              value={form.summary}
              onChange={handleChange}
              readOnly={!editMode}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowConfirm(true)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
              onClick={() => setEditMode(true)}
            >
              Edit Book Info
            </button>
          )}
        </div>
        {showConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Save</h3>
              <p className="mb-6">Are you sure you want to save changes to this book?</p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 font-semibold disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        )}
      </div>
    </div>
  );
};

export default SeeInfo;
