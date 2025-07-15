import React from "react";
import { useRouter } from "next/router";

interface Book {
  id: string; // MongoDB ObjectId as string
  title: string;
  author: string;
  status: string;
  date: string;
  labels: string[];
}

interface BookTableViewProps {
  filteredBooks: Book[];
  statusColors: { [key: string]: string };
}

const BookTableView: React.FC<BookTableViewProps> = ({ filteredBooks, statusColors }) => {
  const router = useRouter();
  const handleRowClick = (id: string) => {
    router.push(`/classification/${id}`);
  };
  return (
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-sm border-b">
            <th className="flex py-4 px-6 font-semibold">
              Name
              <svg
                className="mt-1"
                width="25"
                height="17"
                viewBox="0 0 25 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_50_13170)">
                  <path
                    d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.8484 13.4967V2.83008"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.1819 2.83008V13.4967"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_50_13170">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(8.51514 0.163391)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </th>
            <th className="py-4 px-6 font-semibold">Author</th>
            <th className="flex py-4 px-6 font-semibold">
              Status
              <svg
                className="mt-1"
                width="25"
                height="17"
                viewBox="0 0 25 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_50_13170)">
                  <path
                    d="M22.5152 10.8301L19.8486 13.4967L17.1819 10.8301"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.8484 13.4967V2.83008"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5151 5.49674L13.1818 2.83008L15.8485 5.49674"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.1819 2.83008V13.4967"
                    stroke="#111827"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_50_13170">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(8.51514 0.163391)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </th>
            <th className="py-4 px-6 font-semibold">Date Submitted</th>
            <th className="py-4 px-6 font-semibold">Labels (If Classified)</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book, idx) => (
            <tr
              key={book.id}
              className="hover:bg-blue-50/60 transition cursor-pointer"
              onClick={() => handleRowClick(book.id)}
            >
              <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                {book.title}
              </td>
              <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                {book.author}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[book.status] ||
                    "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {book.status}
                </span>
              </td>
              <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                {book.date}
              </td>
              <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                {book.labels.includes("NIL") ? (
                  <span className="text-gray-700 font-bold">-- NIL --</span>
                ) : (
                  book.labels.join(", ")
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTableView;
