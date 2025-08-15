import React from "react";
import AnalysisCard from "./AnalysisCard";
import { useBooks } from "@/context/BookContext";

const AnalysisCardRow: React.FC = () => {
  const { books } = useBooks();
  const totalProcessed = books.filter((book) => book.status === "Processed").length;
  const totalPending = books.filter((book) => book.status === "Pending").length;
  return (
    <div className="flex w-full mx-auto mt-4 justify-around">
      <AnalysisCard
        value={totalProcessed}
        label="Total In-Depth Reviewed Books"
        icon={
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.1375 29.2119V9.96191" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22.6375 16.8369L25.3875 19.5869L30.8875 14.0869" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M30.8875 8.58691V5.83691C30.8875 5.47224 30.7426 5.1225 30.4847 4.86464C30.2269 4.60678 29.8771 4.46191 29.5125 4.46191H22.6375C21.1788 4.46191 19.7798 5.04138 18.7484 6.07283C17.7169 7.10428 17.1375 8.50322 17.1375 9.96191C17.1375 8.50322 16.558 7.10428 15.5265 6.07283C14.4951 5.04138 13.0961 4.46191 11.6375 4.46191H4.76245C4.39778 4.46191 4.04804 4.60678 3.79018 4.86464C3.53232 5.1225 3.38745 5.47224 3.38745 5.83691V23.7119C3.38745 24.0766 3.53232 24.4263 3.79018 24.6842C4.04804 24.942 4.39778 25.0869 4.76245 25.0869H13.0125C14.1065 25.0869 15.1557 25.5215 15.9293 26.2951C16.7029 27.0687 17.1375 28.1179 17.1375 29.2119C17.1375 28.1179 17.572 27.0687 18.3456 26.2951C19.1192 25.5215 20.1684 25.0869 21.2625 25.0869H29.5125C29.8771 25.0869 30.2269 24.942 30.4847 24.6842C30.7426 24.4263 30.8875 24.0766 30.8875 23.7119V21.9244" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
        }
      />
      <AnalysisCard
        value={totalPending}
        label="In-depth Review Pending Books"
        icon={
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.26245 16.8369C4.26245 13.5549 5.56624 10.4072 7.887 8.08647C10.2078 5.7657 13.3554 4.46191 16.6375 4.46191C20.097 4.47493 23.4176 5.82485 25.905 8.22941L29.0125 11.3369" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M29.0125 4.46191V11.3369H22.1375" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M29.0125 16.8369C29.0125 20.119 27.7087 23.2666 25.3879 25.5874C23.0671 27.9081 19.9195 29.2119 16.6375 29.2119C13.1779 29.1989 9.85728 27.849 7.36995 25.4444L4.26245 22.3369" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11.1375 22.3369H4.26245V29.2119" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        }
      />
    </div>
  );
};

export default AnalysisCardRow;
