import React, { useState } from "react";

const DEPARTMENTS = [
  "Political",
  "Maths",
  "AI/CS",
  "Religious",
  "Geological",
  "Graphical",
  "Logical",
];

interface AssignDepartmentFormProps {
  open: boolean;
  onClose: () => void;
  onAssign: (departments: string[]) => void;
}

const AssignDepartmentForm: React.FC<AssignDepartmentFormProps> = ({ open, onClose, onAssign }) => {
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  const handleToggle = (dept: string) => {
    setSelected((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleAssign = () => {
    onAssign(selected);
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative border-t-4 border-t-blue-500">
        <h2 className="text-lg font-bold mb-4">Assign Book to Department</h2>
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2">Assign to Department</div>
          <div className="grid grid-cols-4 gap-4">
            {DEPARTMENTS.map((dept) => (
              <label key={dept} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={selected.includes(dept)}
                  onChange={() => handleToggle(dept)}
                  className="accent-blue-500 w-4 h-4"
                />
                {dept}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition"
            onClick={handleAssign}
            disabled={selected.length === 0}
          >
            Assign to Department
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDepartmentForm;
