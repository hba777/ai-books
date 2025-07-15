'use client';

import dynamic from 'next/dynamic';

const PDFViewerActual = dynamic(() => import('./PDFViewerActual'), { ssr: false });

export default PDFViewerActual;
