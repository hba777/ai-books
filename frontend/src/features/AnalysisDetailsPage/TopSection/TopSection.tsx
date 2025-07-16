import React from "react";
import { useRouter } from "next/router";

interface TopSectionProps {
  bookTitle: string;
  tags: string[];
  bookId: string;
  onSeeInfo?: () => void;
}

const TopSection: React.FC<TopSectionProps> = ({ bookTitle, tags, bookId, onSeeInfo }) => {
  const router = useRouter();
  return (
    <div className="w-full mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => router.push("/analysis")}
        >
          In-Depth Review Books
        </span>
        <span className="mx-2">/</span>
        <span
          className="text-blue-700 font-medium cursor-pointer hover:underline"
          onClick={() => router.push(router.asPath)}
        >
          In-Depth Analysis Result
        </span>
      </div>
      {/* Title and See Info */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{bookTitle}</h1>
        <button onClick={onSeeInfo} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold cursor-pointer">
          See Info
        </button>
      </div>
      {/* Classification Result and Route Button */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-semibold text-gray-700">
          Classification Result
        </span>
        <div className="bg-blue-400 rounded p-1 cursor-pointer">
        <svg onClick={() => router.push(`/classification/${bookId}`)}
            width="22"
            height="22"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.3999 21.8367V7.83667"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16.3999 12.8367L18.3999 14.8367L22.3999 10.8367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22.3999 6.83667V4.83667C22.3999 4.57145 22.2945 4.3171 22.107 4.12956C21.9195 3.94203 21.6651 3.83667 21.3999 3.83667H16.3999C15.339 3.83667 14.3216 4.2581 13.5715 5.00824C12.8213 5.75839 12.3999 6.7758 12.3999 7.83667C12.3999 6.7758 11.9785 5.75839 11.2283 5.00824C10.4782 4.2581 9.46077 3.83667 8.3999 3.83667H3.3999C3.13469 3.83667 2.88033 3.94203 2.6928 4.12956C2.50526 4.3171 2.3999 4.57145 2.3999 4.83667V17.8367C2.3999 18.1019 2.50526 18.3562 2.6928 18.5438C2.88033 18.7313 3.13469 18.8367 3.3999 18.8367H9.3999C10.1956 18.8367 10.9586 19.1527 11.5212 19.7153C12.0838 20.278 12.3999 21.041 12.3999 21.8367C12.3999 21.041 12.716 20.278 13.2786 19.7153C13.8412 19.1527 14.6043 18.8367 15.3999 18.8367H21.3999C21.6651 18.8367 21.9195 18.7313 22.107 18.5438C22.2945 18.3562 22.3999 18.1019 22.3999 17.8367V16.5367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          </div>  
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-4 py-1 bg-[#ECECF8] text-gray-700 rounded-md text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopSection;
