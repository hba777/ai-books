import React from 'react';
import InDepthAnalysisCard from './InDepthAnalysisCard';
import { MdRefresh } from 'react-icons/md';

const InDepthAnalysisCardRow: React.FC = () => (
  <div className="flex gap-6">
    <InDepthAnalysisCard
      value={245}
      label="Total In-Depth Reviewed Books"
      icon={<svg
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
      </svg>}
    />
    <InDepthAnalysisCard
      value={2459}
      label="In-depth Review Pending Books"
      icon={<MdRefresh />}
    />
  </div>
);

export default InDepthAnalysisCardRow;
