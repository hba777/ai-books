import React from "react";

interface DeleteAgentProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
}

const DeleteAgent: React.FC<DeleteAgentProps> = ({ open, onClose, onConfirm, agentName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative flex flex-col items-center border-t-4 border-blue-500"
        style={{ borderTopWidth: "6px" }}
      >
        {/* Blue icon in rounded square */}
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500 mb-4 mt-2">
          {/* Trash SVG icon placeholder */}
          <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.66992V20.6699C19 21.2004 18.7893 21.7091 18.4142 22.0841C18.0391 22.4592 17.5304 22.6699 17 22.6699H7C6.46957 22.6699 5.96086 22.4592 5.58579 22.0841C5.21071 21.7091 5 21.2004 5 20.6699V6.66992"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6.66992H21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6.66992V4.66992C8 4.13949 8.21071 3.63078 8.58579 3.25571C8.96086 2.88064 9.46957 2.66992 10 2.66992H14C14.5304 2.66992 15.0391 2.88064 15.4142 3.25571C15.7893 3.63078 16 4.13949 16 4.66992V6.66992"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Do you really want to Delete Agent{agentName ? ` "${agentName}"` : ""}?
          </h2>
          <p className="text-gray-500 mb-8 text-base">
            This will permanently delete the agent and its history.
          </p>
        </div>
        <div className="flex justify-center gap-4 w-full mt-2">
          <button
            className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition w-1/2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg from-[#2563EB] to-[#9333EA] bg-gradient-to-r text-white font-semibold transition w-1/2"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAgent;
