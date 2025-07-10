    import React, { useRef, useState } from "react";
    import { ImCross } from "react-icons/im";

    interface BookFormState {
      title: string;
      author: string;
      date: string;
      reference: string;
      category: string;
      abstract: string;
    }

    const defaultBookForm: BookFormState = {
      title: "",
      author: "",
      date: "",
      reference: "",
      category: "History",
      abstract: "",
    };

    const UploadButtonForm: React.FC<{ open: boolean; onClose: () => void }> = ({
      open,
      onClose,
    }) => {
      const fileInputRef = useRef<HTMLInputElement>(null);
      const [dragActive, setDragActive] = useState(false);
      const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
      const [activeIndex, setActiveIndex] = useState(0);
      const [bookForms, setBookForms] = useState<{ [idx: number]: BookFormState }>(
        {}
      );

      if (!open) return null;

      // Handle file selection (from input or drop)
      const handleFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
          const newFiles = Array.from(files);
          setSelectedFiles((prev) => [...prev, ...newFiles]);
          setBookForms((prev) => {
            const updated = { ...prev };
            const startIdx = selectedFiles.length;
            newFiles.forEach((_, i) => {
              updated[startIdx + i] = { ...defaultBookForm };
            });
            return updated;
          });
          setActiveIndex(selectedFiles.length); // focus first new file
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

      // Remove a file and its form state
      const removeFile = (idx: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
        setBookForms((prev) => {
          const updated = { ...prev };
          delete updated[idx];
          // Re-index forms
          const newForms: { [idx: number]: BookFormState } = {};
          Object.keys(updated)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach((oldIdx, i) => {
              newForms[i] = updated[oldIdx];
            });
          return newForms;
        });
        setActiveIndex((prev) =>
          prev > 0 && prev === idx ? prev - 1 : Math.max(0, Math.min(prev, selectedFiles.length - 2))
        );
      };

      // Handle form field change for the active book
      const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const { name, value } = e.target;
        setBookForms((prev) => ({
          ...prev,
          [activeIndex]: { ...prev[activeIndex], [name]: value },
        }));
      };

      return (
        <div className="fixed inset-0 z-50 bg-gray-900/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-xl w-full max-w-lg relative animate-fadeIn flex flex-col">
            {/* Header row */}
            <div className="flex items-center justify-between p-4 pt-6 pb-2 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-0">Upload Books Here</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-4"
                onClick={onClose}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="p-4 pt-2 overflow-y-auto max-h-[90vh] rounded-2xl custom-scrollbar">
              {/* Drag-and-drop area */}
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
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip"
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
                    Drag and drop files here or click to upload
                  </span>
                  <span className="text-xs text-gray-400 mb-1">
                    File size: <span className="font-bold">40 GB</span> &nbsp;|&nbsp; File type: <span className="font-bold">PDF, DOC, ZIP</span>
                  </span>
                </div>
              </div>
              {/* Book containers row */}
              {selectedFiles.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all border ${activeIndex === idx
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 text-white border-transparent"
                      }`}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        className="ml-2 text-white hover:text-red-200"
                        onClick={e => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        aria-label="Remove file"
                        type="button"
                      >
                        <ImCross size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Book form for active file */}
              {selectedFiles.length > 0 && (
                <form className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Book Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={bookForms[activeIndex]?.title || ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      placeholder="Enter book name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Author Name*</label>
                    <input
                      type="text"
                      name="author"
                      value={bookForms[activeIndex]?.author || ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Date Submitted*</label>
                    <input
                      type="date"
                      name="date"
                      value={bookForms[activeIndex]?.date || ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Reference</label>
                    <input
                      type="text"
                      name="reference"
                      value={bookForms[activeIndex]?.reference || ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      placeholder="Enter Reference Here"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">General Category</label>
                    <select
                      name="category"
                      value={bookForms[activeIndex]?.category || "History"}
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
                    <label className="block text-gray-700 font-semibold mb-1">Abstract</label>
                    <textarea
                      name="abstract"
                      value={bookForms[activeIndex]?.abstract || ""}
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
