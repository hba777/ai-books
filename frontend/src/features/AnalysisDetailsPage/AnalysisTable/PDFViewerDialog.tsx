import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { MdLocalPrintshop } from "react-icons/md";

// Dynamically import the entire PDF viewer component with no SSR
const PDFViewerContent = dynamic(() => import("./PDFViewerContent"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  doc_name: string;
  coordinates?: number[];
  pageNumber?: number;
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = (props) => {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!props.isOpen || !isClient) return null;

  return <PDFViewerContent {...props} />;
};

export default PDFViewerDialog;
