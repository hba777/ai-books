import React from 'react';
import { useBooks } from '@/context/BookContext';

const InDepthAnalysisCardRow: React.FC = () => {
  const  { books } = useBooks();
  const totalProcessed = books.filter((book) => book.status === "Processed" || book.status === "Assigned").length;
  const totalClassified = books.filter((book) => book.status === "Classified" || book.status === "Assigned").length;
  const totalPending = books.filter((book) => book.status === "Pending").length;

  const cardData = [
    {
      value: totalClassified,
      label: 'Classified Books',
      icon: (
        <svg width="26" height="27" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.30042 17.9518V5.11463C2.30042 4.54719 2.52583 4.00299 2.92707 3.60175C3.32831 3.20051 3.87251 2.9751 4.43995 2.9751H16.2074" stroke="white" strokeWidth="1.43691" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23.6967 20.0918H11.9292C11.3618 20.0918 10.8176 20.3173 10.4163 20.7185C10.0151 21.1197 9.78967 21.6639 9.78967 22.2314M9.78967 22.2314C9.78967 22.7988 10.0151 23.343 10.4163 23.7443C10.8176 24.1455 11.3618 24.3709 11.9292 24.3709H23.1618C23.3036 24.3709 23.4397 24.3146 23.54 24.2143C23.6403 24.1139 23.6967 23.9779 23.6967 23.836V7.78952C23.6967 7.64766 23.6403 7.51161 23.54 7.4113C23.4397 7.31099 23.3036 7.25464 23.1618 7.25464H11.9292C11.3618 7.25464 10.8176 7.48005 10.4163 7.88129C10.0151 8.28253 9.78967 8.82673 9.78967 9.39417V22.2314Z" stroke="white" strokeWidth="1.43691" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.50972 15.813H4.43995C3.87251 15.813 3.32831 16.0384 2.92707 16.4396C2.52583 16.8409 2.30042 17.3851 2.30042 17.9525C2.30042 18.52 2.52583 19.0642 2.92707 19.4654C3.32831 19.8666 3.87251 20.0921 4.43995 20.0921H5.50972" stroke="white" strokeWidth="1.43691" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
      value: totalProcessed,
      label: 'In-Depth Reviewed Books',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.7371 24.8772V9.00439" stroke="white" strokeWidth="1.64912" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.2722 14.6733L20.5398 16.9409L25.0749 12.4058" stroke="white" strokeWidth="1.64912" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25.0746 7.8708V5.60326C25.0746 5.30256 24.9552 5.01418 24.7425 4.80156C24.5299 4.58893 24.2415 4.46948 23.9408 4.46948H18.272C17.0692 4.46948 15.9157 4.94729 15.0652 5.79778C14.2147 6.64827 13.7369 7.80179 13.7369 9.00457C13.7369 7.80179 13.2591 6.64827 12.4086 5.79778C11.5581 4.94729 10.4046 4.46948 9.20181 4.46948H3.53294C3.23225 4.46948 2.94387 4.58893 2.73124 4.80156C2.51862 5.01418 2.39917 5.30256 2.39917 5.60326V20.3423C2.39917 20.643 2.51862 20.9314 2.73124 21.144C2.94387 21.3566 3.23225 21.4761 3.53294 21.4761H10.3356C11.2377 21.4761 12.1028 21.8344 12.7407 22.4723C13.3785 23.1102 13.7369 23.9753 13.7369 24.8774C13.7369 23.9753 14.0952 23.1102 14.7331 22.4723C15.371 21.8344 16.2361 21.4761 17.1382 21.4761H23.9408C24.2415 21.4761 24.5299 21.3566 24.7425 21.144C24.9552 20.9314 25.0746 20.643 25.0746 20.3423V18.8684" stroke="white" strokeWidth="1.64912" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    },
    {
      value: totalPending,
      label: 'Review Pending Books',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.4585 14.6733C3.4585 11.9808 4.52805 9.39869 6.43188 7.49487C8.33571 5.59104 10.9178 4.52148 13.6103 4.52148C16.4483 4.53216 19.1723 5.63956 21.2128 7.61213L23.762 10.1614" stroke="white" strokeWidth="1.64069" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23.7615 4.52148V10.1614H18.1216" stroke="white" strokeWidth="1.64069" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23.762 14.6733C23.762 17.3658 22.6925 19.9479 20.7886 21.8517C18.8848 23.7556 16.3027 24.8251 13.6103 24.8251C10.7722 24.8144 8.04819 23.707 6.00772 21.7345L3.4585 19.1852" stroke="white" strokeWidth="1.64069" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.09837 19.1851H3.4585V24.8249" stroke="white" strokeWidth="1.64069" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    },
  ];
  return (
    <div className="w-full mx-auto flex gap-3 lg:gap-4 justify-around items-stretch px-4">
    {cardData.map((card, idx) => (
      <div
        key={idx}
        className="flex flex-col items-start bg-white rounded-xl shadow-lg p-4 lg:p-6 w-full sm:w-[300px] md:w-[350px] lg:w-[400px] xl:w-[500px] h-36 lg:h-49"
      >
        <div className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-md mb-2 lg:mb-3 ${card.iconBg}`}>
          <span className="text-white text-xl lg:text-2xl">{card.icon}</span>
        </div>
        <div className="text-2xl lg:text-3xl font-bold text-black mb-1">{card.value}</div>
        <div className="text-gray-700 text-sm lg:text-base leading-tight">{card.label}</div>
      </div>
    ))}
  </div>
  )
};

export default InDepthAnalysisCardRow;
