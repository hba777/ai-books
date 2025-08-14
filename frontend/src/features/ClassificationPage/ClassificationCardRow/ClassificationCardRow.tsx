import React from "react";
import ClassificationStatCard from "./ClassificationCard";
import { useClassificationContext } from "./ClassificationContext";
import { useBooks } from "@/context/BookContext";

const ClassificationCardRow: React.FC = () => {
  const { currentFilter, setCurrentFilter } = useClassificationContext();
  const { books } = useBooks();
  const totalBooks = books.length;
  const totalProcessed = books.filter((book) => book.status === "Processed").length;
  const totalPending = books.filter((book) => book.status === "Pending").length;
  const totalAssigned = books.filter((book) => book.status === "Assigned").length;

  return (
    <div className="flex gap-3 lg:gap-4 w-full justify-center mt-6 mb-8 px-4">
      <ClassificationStatCard
        value={totalBooks}
        label="Books Uploaded"
        subtitle=""
        bgColor={["#3B82F6", "#2563EB"]}
        onClick={() => setCurrentFilter('Unprocessed')}
        isActive={currentFilter === 'Unprocessed'}
        icon={
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.39932 16.836V4.836C2.39932 4.30557 2.61004 3.79686 2.98511 3.42178C3.36018 3.04671 3.86889 2.836 4.39932 2.836H15.3993"
              stroke="white"
              stroke-width="1.3432"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22.3992 18.8364H11.3992C10.8687 18.8364 10.36 19.0471 9.98496 19.4222C9.60988 19.7973 9.39917 20.306 9.39917 20.8364M9.39917 20.8364C9.39917 21.3669 9.60988 21.8756 9.98496 22.2506C10.36 22.6257 10.8687 22.8364 11.3992 22.8364H21.8992C22.0318 22.8364 22.159 22.7837 22.2527 22.69C22.3465 22.5962 22.3992 22.469 22.3992 22.3364V7.33643C22.3992 7.20382 22.3465 7.07664 22.2527 6.98287C22.159 6.8891 22.0318 6.83643 21.8992 6.83643H11.3992C10.8687 6.83643 10.36 7.04714 9.98496 7.42221C9.60988 7.79728 9.39917 8.30599 9.39917 8.83643V20.8364Z"
              stroke="white"
              stroke-width="1.3432"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5.39932 14.8367H4.39932C3.86889 14.8367 3.36018 15.0474 2.98511 15.4225C2.61004 15.7975 2.39932 16.3062 2.39932 16.8367C2.39932 17.3671 2.61004 17.8758 2.98511 18.2509C3.36018 18.626 3.86889 18.8367 4.39932 18.8367H5.39932"
              stroke="white"
              stroke-width="1.3432"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        } 
      />
      <ClassificationStatCard
        value={totalProcessed}
        label="Total Processed"
        subtitle=""
        bgColor={["#22C55E", "#16A34A"]}
        onClick={() => setCurrentFilter('Processed')}
        isActive={currentFilter === 'Processed'}
        badge={
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            +8%
          </span>
        }
        icon={
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.4 21.8367V7.83667"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16.4 12.8367L18.4 14.8367L22.4 10.8367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22.4 6.83667V4.83667C22.4 4.57145 22.2947 4.3171 22.1071 4.12956C21.9196 3.94203 21.6652 3.83667 21.4 3.83667H16.4C15.3392 3.83667 14.3217 4.2581 13.5716 5.00824C12.8215 5.75839 12.4 6.7758 12.4 7.83667C12.4 6.7758 11.9786 5.75839 11.2285 5.00824C10.4783 4.2581 9.46089 3.83667 8.40002 3.83667H3.40002C3.13481 3.83667 2.88045 3.94203 2.69292 4.12956C2.50538 4.3171 2.40002 4.57145 2.40002 4.83667V17.8367C2.40002 18.1019 2.50538 18.3562 2.69292 18.5438C2.88045 18.7313 3.13481 18.8367 3.40002 18.8367H9.40002C10.1957 18.8367 10.9587 19.1527 11.5213 19.7153C12.084 20.278 12.4 21.041 12.4 21.8367C12.4 21.041 12.7161 20.278 13.2787 19.7153C13.8413 19.1527 14.6044 18.8367 15.4 18.8367H21.4C21.6652 18.8367 21.9196 18.7313 22.1071 18.5438C22.2947 18.3562 22.4 18.1019 22.4 17.8367V16.5367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        } 
      />
      
      <ClassificationStatCard
        value={totalPending}
        label="Pending Books"
        subtitle=""
        bgColor={["#F97316", "#EA580C"]}
        onClick={() => setCurrentFilter('Pending')}
        isActive={currentFilter === 'Pending'}
        icon={
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.40002 12.8367C3.40002 10.4497 4.34824 8.16054 6.03606 6.47271C7.72389 4.78488 10.0131 3.83667 12.4 3.83667C14.9161 3.84614 17.3311 4.82789 19.14 6.57667L21.4 8.83667"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21.4 3.83667V8.83667H16.4"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21.4 12.8367C21.4 15.2236 20.4518 17.5128 18.764 19.2006C17.0762 20.8885 14.787 21.8367 12.4 21.8367C9.88398 21.8272 7.46899 20.8454 5.66002 19.0967L3.40002 16.8367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.40002 16.8367H3.40002V21.8367"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      />
      <ClassificationStatCard
        value={totalAssigned}
        label="Books Assigned"
        subtitle=""
        bgColor={["#A855F7", "#9333EA"]}
        onClick={() => setCurrentFilter('Assigned')}
        isActive={currentFilter === 'Assigned'}
        badge={
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            +5%
          </span>
        }
        icon={
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.3999 21.8367L12.3999 17.8367L5.3999 21.8367V5.83667C5.3999 5.30624 5.61062 4.79753 5.98569 4.42246C6.36076 4.04738 6.86947 3.83667 7.3999 3.83667H17.3999C17.9303 3.83667 18.439 4.04738 18.8141 4.42246C19.1892 4.79753 19.3999 5.30624 19.3999 5.83667V21.8367Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.3999 10.8367H9.3999"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      />
    </div>
  );
};

export default ClassificationCardRow;
