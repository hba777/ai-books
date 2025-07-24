import React, { useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { useBooks } from "@/context/BookContext";
import { toast } from "react-toastify";

interface BookFormState {
  title: string;
  author: string;
  date: string;
  reference: string;
  category: string;
  abstract_summary: string;
}

const defaultBookForm: BookFormState = {
  title: "",
  author: "",
  date: "",
  reference: "",
  category: "History",
  abstract_summary: "",
};

const UploadButtonForm: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bookForm, setBookForm] = useState<BookFormState>(defaultBookForm);
  const { createBook } = useBooks();

  if (!open) return null;

  // Handle file selection (from input or drop)
  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setBookForm(defaultBookForm);
      } else {
        alert("Only PDF files are allowed.");
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Remove the file and reset form
  const removeFile = () => {
    setSelectedFile(null);
    setBookForm(defaultBookForm);
  };

  // Handle form field change
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedFile) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();

  // Map frontend fields to backend fields
  formData.append("doc_name", bookForm.title);
  formData.append("author", bookForm.author);
  formData.append("date", bookForm.date);
  formData.append("category", bookForm.category);
  formData.append("reference", bookForm.reference);
  formData.append("status", "Pending");
  formData.append("summary", bookForm.abstract_summary);
  formData.append("labels", JSON.stringify([]));
  formData.append("startDate", "");
  formData.append("endDate", "");

  // Only append file if it's not null
  formData.append("file", selectedFile);

  try {
    await createBook(formData);
    toast.success("Book creation successful!");
    onClose();
  } catch (err) {
    toast.error("Error creating book:" + (err as Error).message);
  }
};


  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 flex items-center justify-center">
      <div className="bg-white rounded shadow-xl w-full max-w-lg relative animate-fadeIn flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between p-4 pt-6 pb-2 sticky top-0 bg-white z-10 rounded-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-0">
            Upload Book Here
          </h2>
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 text-2xl font-bold border border-gray-300 hover:border-gray-400 rounded-xl"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="p-4 pt-2 overflow-y-auto max-h-[90vh] rounded-2xl ">
          {/* Drag-and-drop area */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center mb-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleInputChange}
              />
              <div className="flex flex-col items-center">
                <svg width="40" height="40" fill="none" viewBox="0 0 48 48">
                  <rect width="40" height="40" rx="20" fill="#EEF2FF" />
                  <path
                    d="M20 28V14M20 14l-5 5M20 14l5 5"
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-blue-600 font-semibold mt-2 mb-1 text-center text-sm">
                  Drag and drop a PDF file here or click to upload
                </span>
                <span className="text-xs text-gray-400 mb-1">
                  File type: <span className="font-bold">PDF</span>
                </span>
              </div>
            </div>
          )}
          {/* File display */}
          {selectedFile && (
            <div className="flex items-center min-w-[200px] max-w-[230px] px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4">
              <span className="truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <button
                className="ml-2 text-white hover:text-red-200"
                onClick={removeFile}
                aria-label="Remove file"
                type="button"
              >
                <ImCross size={14} />
              </button>
            </div>
          )}
          {/* Book form for selected file */}
          {selectedFile && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Book Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={bookForm.title}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  placeholder="Enter book name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Author Name*
                </label>
                <input
                  type="text"
                  name="author"
                  value={bookForm.author}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  placeholder="Enter author name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Date Submitted*
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookForm.date}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  name="reference"
                  value={bookForm.reference}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  placeholder="Enter Reference Here"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  General Category
                </label>
                <select
                  name="category"
                  value={bookForm.category}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                >
                  <option>History</option>
                  <option>Science</option>
                  <option>Fiction</option>
                  <option>Biography</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Abstract
                </label>
                <textarea
                  name="abstract_summary"
                  value={bookForm.abstract_summary}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  placeholder="Max 200 words"
                  rows={3}
                  maxLength={200}
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadButtonForm;
