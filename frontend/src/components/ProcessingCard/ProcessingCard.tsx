import React, { useEffect, useState } from "react";
import axios from "axios";

const ProcessingCard: React.FC = () => {
  const [status, setStatus] = useState<"classifying" | "analysing" | null>(
    null
  );

//   useEffect(() => {
//     // Example API call, replace '/api/status' with your actual endpoint
//     axios.get("/api/status").then((res) => {
//       // Assume response: { status: 'classifying' } or { status: 'analysing' }
//       setStatus(res.data.status);
//     });
//   }, []);

  let text = "";
  if (status === "classifying") text = "Classifying:";
  else if (status === "analysing") text = "Analysing";
  else text = "Processing...";

  return (
    <div className="flex items-center bg-white rounded-xl shadow p-5 min-w-[260px] gap-4">
      {/* Icon placeholder */}
      <span className="w-10 h-10 rounded-full p-2 bg-[#f66e14] flex items-center justify-center mr-2">
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.26245 16.8369C4.26245 13.5549 5.56624 10.4072 7.887 8.08647C10.2078 5.7657 13.3554 4.46191 16.6375 4.46191C20.097 4.47493 23.4176 5.82485 25.905 8.22941L29.0125 11.3369"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M29.0125 4.46191V11.3369H22.1375"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M29.0125 16.8369C29.0125 20.119 27.7087 23.2666 25.3879 25.5874C23.0671 27.9081 19.9195 29.2119 16.6375 29.2119C13.1779 29.1989 9.85728 27.849 7.36995 25.4444L4.26245 22.3369"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11.1375 22.3369H4.26245V29.2119"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      {/* Text */}
      <span className="text-lg font-semibold text-gray-800">{text}</span>
    </div>
  );
};

export default ProcessingCard;
