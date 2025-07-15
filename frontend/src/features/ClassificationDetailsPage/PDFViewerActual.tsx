'use client';

import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FiChevronLeft, FiChevronRight} from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { MdLocalPrintshop } from "react-icons/md";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

interface Highlight {
  id: string;
  pageNumber: number;
  bbox: [number, number, number, number]; // x0, y0, x1, y1
  class: string;
}

const sampleHighlights: Highlight[] = [
  { id: "math-1", pageNumber: 1, bbox: [100, 200, 300, 230], class: "Maths" },
  { id: "math-2", pageNumber: 2, bbox: [80, 150, 320, 190], class: "Maths" }
];

interface PDFViewerActualProps {
  jumpToHighlight?: { className: string; direction: 'next' | 'prev' } | null;
}

const PDFViewerActual: React.FC<PDFViewerActualProps> = ({ jumpToHighlight }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  const handleDownload = () => {
    window.open('/EnterpreneurshipBook.pdf', '_blank');
  };
  const handlePrint = () => {
    const win = window.open('/EnterpreneurshipBook.pdf', '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  useEffect(() => {
    if (jumpToHighlight) {
      console.log(jumpToHighlight);
      // Find all highlights for the class across all pages
      const highlights = sampleHighlights.filter(h => h.class === jumpToHighlight.className);
      if (highlights.length > 0) {
        // Find the current highlight index
        let idx = 0;
        if (activeHighlightId) {
          idx = highlights.findIndex(h => h.id === activeHighlightId);
        }
        let nextIdx = 0;
        if (jumpToHighlight.direction === 'next') {
          nextIdx = (idx + 1) % highlights.length;
        } else {
          nextIdx = (idx - 1 + highlights.length) % highlights.length;
        }
        const highlight = highlights[nextIdx];
        setActiveHighlightId(highlight.id);
        if (highlight.pageNumber !== pageNumber) {
          setPendingHighlightId(highlight.id);
          setPageNumber(highlight.pageNumber);
        } else {
          setTimeout(() => {
            const el = document.getElementById(`highlight-${highlight.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToHighlight]);

  // When page changes, scroll to pending highlight if needed
  useEffect(() => {
    if (pendingHighlightId) {
      setTimeout(() => {
        const el = document.getElementById(`highlight-${pendingHighlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setPendingHighlightId(null);
      }, 200);
    }
  }, [pageNumber, pendingHighlightId]);

  return (
    <div className="flex-1 flex flex-col ml-6 max-w-3xl min-w-[400px] h-180  pt-0 mt-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-2 mb-4 bg-black/80 mt-0 pt-0">
        {/* File name left */}
        <div className="flex items-center ml-3 min-w-[180px]">
          <span className="font-semibold text-white text-base">The Kite Runner.pdf</span>
        </div>
        {/* Center controls */}
        <div className="flex items-center gap-2 mx-auto">
          <button onClick={goToPrevPage} className="p-2 hover:bg-gray-400" disabled={pageNumber <= 1}>
            <FiChevronLeft className="text-white" />
          </button>
          <span className="px-2 text-sm font-semibold text-white">{pageNumber} / {numPages || 1}</span>
          <button onClick={goToNextPage} className="p-2 hover:bg-gray-400" disabled={numPages ? pageNumber >= numPages : true}>
            <FiChevronRight className="text-white"/>
          </button>
          <button onClick={zoomOut} className="p-2 text-white hover:bg-gray-400"><RiSubtractFill /></button>
          <span className="px-1 text-sm text-white">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 text-white hover:bg-gray-400"><IoIosAdd /></button>
        </div>
        {/* Download/Print right */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end p-2 mr-2">
          <button onClick={handleDownload} className="p-2 hover:bg-gray-400" title="Download">
            <IoMdDownload className="text-xl text-white" />
          </button>
          <button onClick={handlePrint} className=" hover:bg-gray-400" title="Print">
            <MdLocalPrintshop className="text-xl text-white" />
          </button>
        </div>
      </div>
      <div ref={viewerRef} className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4" style={{ minHeight: 400 }}>
        <Document
          file="/EnterpreneurshipBook.pdf" // Replace with actual file path
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <div className="relative mb-6">
            <Page
              pageNumber={pageNumber}
              scale={scale}
            />
            {/* Overlay highlights (optional, keep if needed) */}
            {sampleHighlights
              .filter(h => h.pageNumber === pageNumber)
              .map(h => (
                <div
                  id={`highlight-${h.id}`}
                  key={h.id}
                  className={`absolute border-2 ${activeHighlightId === h.id ? 'border-yellow-500 z-10' : 'border-yellow-400'} `}
                  style={{
                    top: h.bbox[1] * scale,
                    left: h.bbox[0] * scale,
                    width: (h.bbox[2] - h.bbox[0]) * scale,
                    height: (h.bbox[3] - h.bbox[1]) * scale,
                    background: 'rgba(255, 255, 0, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PDFViewerActual;

