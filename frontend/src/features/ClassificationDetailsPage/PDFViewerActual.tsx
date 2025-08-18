"use client";

import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { MdLocalPrintshop } from "react-icons/md";


if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
}

interface PDFViewerActualProps {
  jumpToHighlight?: { className: string; direction: "next" | "prev" } | null;
  fileUrl: string | null;
  doc_name: string;
  currentClassificationCoordinates?: number[];
  currentClassificationPage?: number;
}

const PDFViewerActual: React.FC<PDFViewerActualProps> = ({
  jumpToHighlight,
  fileUrl,
  doc_name,
  currentClassificationCoordinates,
  currentClassificationPage,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(
    null
  );

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () =>
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  const handleDownload = () => {
    if (!fileUrl) return;
    // Open the blob URL in a new tab for download
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

  // Navigate to specific coordinates when they change
  useEffect(() => {
    if (currentClassificationCoordinates && currentClassificationPage) {
      // Navigate to the page if it's different
      if (currentClassificationPage !== pageNumber) {
        setPageNumber(currentClassificationPage);
        setPendingHighlightId('current-classification');
      } else {
        // If already on the right page, scroll to coordinates
        setTimeout(() => {
          scrollToCoordinates(currentClassificationCoordinates);
        }, 100);
      }
    }
  }, [currentClassificationCoordinates, currentClassificationPage, pageNumber]);

  const scrollToCoordinates = (coordinates: number[]) => {
    if (coordinates.length >= 4) {
      const [x0, y0, x1, y1] = coordinates;
      const centerX = (x0 + x1) / 2;
      const centerY = (y0 + y1) / 2;
      
      // Calculate the position in the scaled PDF view
      const scaledCenterX = centerX * scale;
      const scaledCenterY = centerY * scale;
      
      // Scroll the viewer to center on these coordinates
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

  // When page changes, scroll to pending highlight if needed
  useEffect(() => {
    if (pendingHighlightId && currentClassificationCoordinates) {
      setTimeout(() => {
        scrollToCoordinates(currentClassificationCoordinates);
        setPendingHighlightId(null);
      }, 200);
    }
  }, [pageNumber, pendingHighlightId, currentClassificationCoordinates]);

  return (
  <div className="flex-1 flex flex-col ml-6 max-w-3xl min-w-[500px] h-300 pt-0 mt-0">
    {/* Toolbar */}
    <div className="flex items-center justify-between border-b pb-2 mb-4 bg-black/80 mt-0 pt-0">
      {/* File name left */}
      <div className="flex items-center ml-3 min-w-[180px]">
        <span className="font-semibold text-white text-base">
          {doc_name}.pdf
        </span>
      </div>
      {/* Center controls */}
      <div className="flex items-center gap-2 mx-auto">
        <button
          onClick={goToPrevPage}
          className="p-2 hover:bg-gray-400"
          disabled={pageNumber <= 1}
        >
          <FiChevronLeft className="text-white" />
        </button>
        <span className="px-2 text-sm font-semibold text-white">
          {pageNumber} / {numPages || 1}
        </span>
        <button
          onClick={goToNextPage}
          className="p-2 hover:bg-gray-400"
          disabled={numPages ? pageNumber >= numPages : true}
        >
          <FiChevronRight className="text-white" />
        </button>
        <button onClick={zoomOut} className="p-2 text-white hover:bg-gray-400">
          <RiSubtractFill />
        </button>
        <span className="px-1 text-sm text-white">
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomIn} className="p-2 text-white hover:bg-gray-400">
          <IoIosAdd />
        </button>
      </div>
      {/* Download/Print right */}
      <div className="flex items-center gap-2 min-w-[80px] justify-end p-2 mr-2">
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-400"
          title="Download"
        >
          <IoMdDownload className="text-xl text-white" />
        </button>
        <button
          onClick={handlePrint}
          className="hover:bg-gray-400"
          title="Print"
        >
          <MdLocalPrintshop className="text-xl text-white" />
        </button>
      </div>
    </div>

    {/* PDF Viewer */}
    <div
      ref={viewerRef}
      className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4"
      style={{ minHeight: 400 }}
    >
      { fileUrl ? (
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <div className="relative mb-6">
            <Page pageNumber={pageNumber} scale={scale} />
            {/* Show current classification highlight if coordinates are available */}
            {currentClassificationCoordinates && 
             currentClassificationPage === pageNumber && 
             currentClassificationCoordinates.length >= 4 && (
              <div
                className="absolute border-2 border-yellow-500 z-10"
                style={{
                  top: currentClassificationCoordinates[1] * scale,
                  left: currentClassificationCoordinates[0] * scale,
                  width: (currentClassificationCoordinates[2] - currentClassificationCoordinates[0]) * scale,
                  height: (currentClassificationCoordinates[3] - currentClassificationCoordinates[1]) * scale,
                  background: "rgba(255, 255, 0, 0.25)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        </Document>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p>Loading PDF...</p>
        </div>
      )}
    </div>
  </div>
);

};

export default PDFViewerActual;
