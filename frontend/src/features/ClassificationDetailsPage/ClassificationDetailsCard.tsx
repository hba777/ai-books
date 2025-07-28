import React from "react";
import AssignDepartmentForm from "./AssignDepartmentForm";

const mockClasses = [
  { name: "Maths", count: 500 },
  { name: "Political", count: 500 },
  { name: "Geo-Political", count: 500 },
  { name: "Religious", count: 500 },
];

interface ClassificationDetailsCardProps {
  onSeeInfo?: () => void;
  onJumpToHighlight?: (className: string, direction: 'next' | 'prev') => void;
}

const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ClassificationDetailsCard: React.FC<ClassificationDetailsCardProps> = ({ onSeeInfo, onJumpToHighlight }) => {
  const [assignModalOpen, setAssignModalOpen] = React.useState(false);
  const [assignedDepartments, setAssignedDepartments] = React.useState<{ name: string; date: string }[]>([]);

  const handleAssign = (departments: string[]) => {
    const today = getToday();
    setAssignedDepartments((prev) => [
      ...prev,
      ...departments.filter(
        (d) => !prev.some((ad) => ad.name === d)
      ).map((d) => ({ name: d, date: today })),
    ]);
  };

  return (
    <div className="w-[370px] bg-white rounded-2xl shadow p-0 mt-8 ml-2 border border-blue-200 border-t-4 border-t-blue-500">
      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg text-gray-900">
            Classification Result
          </span>
          <button
            className="text-xs px-3 py-1 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50"
            onClick={onSeeInfo}
          >
            See Info
          </button>
        </div>
        <div className="mb-2 text-gray-500 text-xs font-semibold">
          Classes <span className="font-normal">- No of Paragraphs</span>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {mockClasses.map((cls, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1"
            >
              <span className="flex-1 text-gray-700 font-semibold text-sm">
                {cls.name}
              </span>
              <input
                type="number"
                value={cls.count}
                readOnly
                className="w-16 text-center border border-gray-200 rounded px-2 py-1 text-sm bg-white font-semibold"
              />
              <button
                className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-lg ml-1"
                onClick={() => onJumpToHighlight && onJumpToHighlight(cls.name, 'prev')}
                title={`Previous ${cls.name} highlight`}
              >
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.28042 1.79872C5.19625 1.79806 5.11182 1.83021 5.04721 1.89499L3.05922 3.88814C2.92967 4.01803 2.92808 4.2296 3.05566 4.36149L5.01338 6.38546C5.14095 6.51736 5.34876 6.51898 5.47831 6.38909C5.60786 6.25921 5.60946 6.04764 5.48188 5.91574L3.75485 4.13026L5.50858 2.37197C5.63813 2.24208 5.63973 2.03051 5.51215 1.89862C5.44852 1.83284 5.3646 1.79938 5.28042 1.79872Z" fill="white"/>
                </svg>
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-lg ml-1"
                onClick={() => onJumpToHighlight && onJumpToHighlight(cls.name, 'next')}
                title={`Next ${cls.name} highlight`}
              >
                
                <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.88438 8.92041C3.99381 8.92041 4.10324 8.87729 4.1866 8.79148L6.75136 6.15132C6.91849 5.97927 6.91849 5.70117 6.75136 5.52912L4.1866 2.88896C4.01946 2.71691 3.74931 2.71691 3.58217 2.88896C3.41503 3.06101 3.41503 3.3391 3.58217 3.51115L5.84471 5.84022L3.58217 8.16928C3.41503 8.34133 3.41503 8.61943 3.58217 8.79148C3.66552 8.87729 3.77495 8.92041 3.88438 8.92041Z" fill="white"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">
              Department Assigned
            </span>
            <button
              className="text-xs px-3 py-1 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50"
              onClick={() => setAssignModalOpen(true)}
            >
              Assign to Department
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {assignedDepartments.length === 0 ? (
              <span className="text-gray-400 text-sm">There is no Department assigned yet.</span>
            ) : (
              assignedDepartments.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-gray-700">{dept.name}</span>
                  <span className="text-xs text-blue-600 font-semibold">Assigned Date: {dept.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <AssignDepartmentForm
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default ClassificationDetailsCard;
