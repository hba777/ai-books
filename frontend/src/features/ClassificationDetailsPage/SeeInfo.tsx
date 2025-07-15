import React from "react";

const SeeInfo: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl relative border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-6">Book Information</h2>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Book Title</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="The Kite Runner"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Author Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="Khalid Hussaini"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Date Submitted</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="05/07/2025"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">Start Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="05/07/2025"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">End Process Date</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="05/07/2025"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">General Category</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="History"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-semibold mb-1">Classification Labels</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold"
              value="Geo-Political, Religious, AI/IT/CS, Operational"
              readOnly
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-1">Abstract</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
            placeholder="Max 200 words"
            rows={3}
            readOnly
          />
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition">
            Edit Book Info
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        )}
      </div>
    </div>
  );
};

export default SeeInfo;
