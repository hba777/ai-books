import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { MdLocalPrintshop } from "react-icons/md";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
}

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  doc_name: string;
  coordinates?: number[];
  pageNumber?: number;
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({
  isOpen,
  onClose,
  fileUrl,
  doc_name,
  coordinates,
  pageNumber = 1,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [scale, setScale] = useState(1.5);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [pendingHighlight, setPendingHighlight] = useState<boolean>(false);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () =>
    setCurrentPage((p) => (numPages ? Math.min(numPages, p + 1) : p));
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${doc_name}.pdf`;
    link.click();
  };

  const handlePrint = () => {
    if (!fileUrl) return;
    const win = window.open(fileUrl, "_blank");
    if (win) {
      win.onload = () => win.print();
    }
  };

  const scrollToCoordinates = (coords: number[]) => {
    if (coords.length >= 4) {
      const [x0, y0, x1, y1] = coords;
      const centerX = (x0 + x1) / 2;
      const centerY = (y0 + y1) / 2;
      
      const scaledCenterX = centerX * scale;
      const scaledCenterY = centerY * scale;
      
      if (viewerRef.current) {
        const container = viewerRef.current;
        const containerRect = container.getBoundingClientRect();
        const scrollLeft = scaledCenterX - containerRect.width / 2;
        const scrollTop = scaledCenterY - containerRect.height / 2;
        
        container.scrollTo({
          left: Math.max(0, scrollLeft),
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  };

  // Navigate to specific coordinates when they change
  useEffect(() => {
    if (coordinates && pageNumber) {
      if (pageNumber !== currentPage) {
        setCurrentPage(pageNumber);
        setPendingHighlight(true);
      } else {
        setTimeout(() => {
          scrollToCoordinates(coordinates);
        }, 100);
      }
    }
  }, [coordinates, pageNumber, currentPage]);

  // When page changes, scroll to pending highlight if needed
  useEffect(() => {
    if (pendingHighlight && coordinates) {
      setTimeout(() => {
        scrollToCoordinates(coordinates);
        setPendingHighlight(false);
      }, 200);
    }
  }, [currentPage, pendingHighlight, coordinates]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(pageNumber);
      setPendingHighlight(false);
    }
  }, [isOpen, pageNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 text-lg">
              {doc_name}.pdf
            </span>
            {coordinates && (
              <span className="ml-4 text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                Highlighted text
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage <= 1}
            >
              <FiChevronLeft className="text-gray-700" />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-700">
              {currentPage} / {numPages || 1}
            </span>
            <button
              onClick={goToNextPage}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
              disabled={numPages ? currentPage >= numPages : true}
            >
              <FiChevronRight className="text-gray-700" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} className="p-2 hover:bg-gray-200 rounded">
              <RiSubtractFill className="text-gray-700" />
            </button>
            <span className="px-2 text-sm text-gray-700">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={zoomIn} className="p-2 hover:bg-gray-200 rounded">
              <IoIosAdd className="text-gray-700" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-200 rounded"
              title="Download"
            >
              <IoMdDownload className="text-gray-700" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-200 rounded"
              title="Print"
            >
              <MdLocalPrintshop className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          ref={viewerRef}
          className="flex-1 overflow-auto bg-gray-50 p-4"
        >
          {fileUrl ? (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <div className="relative mb-6">
                <Page pageNumber={currentPage} scale={scale} />
                {/* Show highlight if coordinates are available */}
                {coordinates && 
                 coordinates.length >= 4 && (
                  <div
                    className="absolute border-2 border-yellow-500 z-10"
                    style={{
                      top: coordinates[1] * scale,
                      left: coordinates[0] * scale,
                      width: (coordinates[2] - coordinates[0]) * scale,
                      height: (coordinates[3] - coordinates[1]) * scale,
                      background: "rgba(255, 255, 0, 0.25)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            </Document>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerDialog;
