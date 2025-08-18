'use client';

import dynamic from 'next/dynamic';

const PDFViewerActual = dynamic(() => import('./PDFViewerActual'), { ssr: false });

interface PDFViewerProps {
  jumpToHighlight?: { className: string; direction: "next" | "prev" } | null;
  fileUrl: string | null;
  doc_name: string;
  currentClassificationCoordinates?: number[];
  currentClassificationPage?: number;
}

export default function PDFViewer({ 
  jumpToHighlight, 
  fileUrl, 
  doc_name, 
  currentClassificationCoordinates, 
  currentClassificationPage 
}: PDFViewerProps) {
  return (
    <PDFViewerActual
      jumpToHighlight={jumpToHighlight}
      fileUrl={fileUrl}
      doc_name={doc_name}
      currentClassificationCoordinates={currentClassificationCoordinates}
      currentClassificationPage={currentClassificationPage}
    />
  );
}
